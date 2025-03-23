import { Request, Response } from 'express';
import Parent, { IParent } from '../models/parent.model';
import User from '../models/user.model';
import { generateToken } from '../utils/jwt';
import mongoose from 'mongoose';

// Helper to convert string ID to ObjectId
const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

// Register a new parent
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if parent already exists
    const parentExists = await Parent.findOne({ email });
    if (parentExists) {
      return res.status(400).json({ message: 'Account already exists with this email' });
    }

    // Create new parent
    const parent = await Parent.create({
      name,
      email,
      password,
      phone,
    });

    if (parent) {
      // Generate JWT token
      const token = generateToken(parent, 'parent');

      res.status(201).json({
        _id: parent._id,
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        students: parent.students,
        token,
        userType: 'parent'
      });
    } else {
      res.status(400).json({ message: 'Invalid parent data' });
    }
  } catch (error: any) {
    console.error('Parent registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login parent
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find parent by email
    const parent = await Parent.findOne({ email }).select('+password');
    if (!parent) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await parent.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login time
    parent.lastLogin = new Date();
    await parent.save();

    // Generate JWT token
    const token = generateToken(parent, 'parent');

    res.status(200).json({
      _id: parent._id,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      students: parent.students,
      notificationSettings: parent.notificationSettings,
      token,
      userType: 'parent'
    });
  } catch (error: any) {
    console.error('Parent login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current parent
export const getCurrentParent = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const parent = await Parent.findById(userId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent account not found' });
    }

    res.status(200).json({
      _id: parent._id,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      students: parent.students,
      notificationSettings: parent.notificationSettings,
      userType: 'parent'
    });
  } catch (error: any) {
    console.error('Get current parent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Link parent to a student
export const linkToStudent = async (req: Request, res: Response) => {
  try {
    const { studentEmail } = req.body;
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const parentId = userId.toString();
    const parentObjectId = toObjectId(parentId);

    // Find the student
    const student = await User.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the parent
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent account not found' });
    }

    // Check if already linked
    if (student.parents.some(pId => pId.equals(parentObjectId)) && 
        parent.students.some(sId => sId.equals(student._id))) {
      return res.status(400).json({ message: 'Student already linked to this parent' });
    }

    // Add parent to student's parent list if not already there
    if (!student.parents.some(pId => pId.equals(parentObjectId))) {
      student.parents.push(parentObjectId);
      await student.save();
    }

    // Add student to parent's student list if not already there
    if (!parent.students.some(sId => sId.equals(student._id))) {
      parent.students.push(student._id);
      await parent.save();
    }

    res.status(200).json({ message: 'Student linked successfully' });
  } catch (error: any) {
    console.error('Link student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student details
export const getStudentDetails = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const parentId = userId.toString();
    const { studentId } = req.params;

    // Find the parent
    const parent = await Parent.findOne({ user: parentId });

    if (!parent) {
      return res.status(404).json({ message: 'Parent account not found' });
    }

    // Convert studentId to ObjectId to ensure proper type comparison
    const studentObjectId = toObjectId(studentId);

    // Check if the student is linked to this parent
    if (!parent.students.some(id => id.equals(studentObjectId))) {
      return res.status(403).json({ message: 'Not authorized to view this student\'s data' });
    }

    // Find the student and populate necessary data
    const student = await User.findById(studentId)
      .populate('performanceData')
      .populate('studyPlan')
      .populate('badges');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      learningStyle: student.learningStyle,
      targetScore: student.targetScore,
      testDate: student.testDate,
      points: student.points,
      badges: student.badges,
      performanceData: student.performanceData,
      studyPlan: student.studyPlan
    });
  } catch (error: any) {
    console.error('Get student details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update notification settings
export const updateNotificationSettings = async (req: Request, res: Response) => {
  try {
    const { email, sms } = req.body;
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const parent = await Parent.findById(userId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent account not found' });
    }

    parent.notificationSettings = {
      email: email !== undefined ? email : parent.notificationSettings.email,
      sms: sms !== undefined ? sms : parent.notificationSettings.sms
    };

    await parent.save();

    res.status(200).json({
      notificationSettings: parent.notificationSettings,
      message: 'Notification settings updated successfully'
    });
  } catch (error: any) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 