import { Request, Response } from 'express';
import StudyGroup from '../models/studyGroup.model';
import User from '../models/user.model';
import { generateRandomCode } from '../utils/helpers';
import mongoose from 'mongoose';
import { JWTPayload } from '../types';

// Helper to convert string ID to ObjectId
const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

// Create a new study group
export const createStudyGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, topics, isPrivate } = req.body;
    
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Generate a random join code for private groups
    const joinCode = isPrivate ? generateRandomCode(8) : null;

    const userObjectId = toObjectId(userId.toString());
    const studyGroup = await StudyGroup.create({
      name,
      description,
      owner: userObjectId,
      members: [userObjectId], // Add the creator as a member
      topics,
      isPrivate,
      joinCode,
    });

    res.status(201).json({
      success: true,
      data: studyGroup,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all public study groups
export const getPublicStudyGroups = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filter by topic if provided
    const topicFilter = req.query.topic 
      ? { topics: { $in: [req.query.topic] } } 
      : {};

    // Only get public groups
    const filter = { 
      isPrivate: false,
      ...topicFilter
    };

    const groups = await StudyGroup.find(filter)
      .populate('owner', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await StudyGroup.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: groups.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: groups,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's study groups
export const getUserStudyGroups = async (req: Request, res: Response) => {
  try {
    // Ensure the user exists in the request
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { userId } = req.user as JWTPayload;
    
    const userObjectId = toObjectId(userId.toString());

    const groups = await StudyGroup.find({
      members: userObjectId,
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    console.error('Error getting user study groups:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Get single study group
export const getStudyGroup = async (req: Request, res: Response) => {
  try {
    // Ensure the user exists in the request
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { userId } = req.user as JWTPayload;
    const { groupId } = req.params;

    const userObjectId = toObjectId(userId.toString());
    
    const group = await StudyGroup.findById(groupId)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Check if the user is a member of the private group
    if (group.isPrivate && !group.members.some(member => member._id.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this private group',
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error('Error getting study group:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Join a study group
export const joinStudyGroup = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;
    const { groupId, joinCode } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const group = await StudyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Check if already a member
    const userObjectId = toObjectId(userId.toString());
    if (group.members.some(memberId => memberId.equals(userObjectId))) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group',
      });
    }

    // Check if private and requires join code
    if (group.isPrivate) {
      if (!joinCode) {
        return res.status(400).json({
          success: false,
          message: 'Join code is required for private groups',
        });
      }

      if (joinCode !== group.joinCode) {
        return res.status(400).json({
          success: false,
          message: 'Invalid join code',
        });
      }
    }

    // Add user to group members
    group.members.push(userObjectId);
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined the study group',
      data: group,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Leave a study group
export const leaveStudyGroup = async (req: Request, res: Response) => {
  try {
    // Ensure the user exists in the request
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { userId } = req.user as JWTPayload;
    const { groupId } = req.params;
    
    const userObjectId = toObjectId(userId.toString());
    
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Study group not found' });
    }
    
    // Check if user is a member
    if (!group.members.some(memberId => memberId.equals(userObjectId))) {
      return res.status(400).json({ error: 'You are not a member of this group' });
    }
    
    // Remove user from members
    await StudyGroup.findByIdAndUpdate(
      groupId,
      { $pull: { members: userObjectId } },
      { new: true }
    );
    
    return res.status(200).json({ message: 'Successfully left the study group' });
  } catch (error) {
    console.error('Error leaving study group:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Update study group
export const updateStudyGroup = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;
    const groupId = req.params.groupId;
    const { name, description, topics, isPrivate } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const group = await StudyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Only owner can update group
    if (group.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the group owner can update the group',
      });
    }

    // Check if privacy is changing from public to private, generate join code
    if (!group.isPrivate && isPrivate) {
      group.joinCode = generateRandomCode(8);
    }

    // Update fields
    group.name = name || group.name;
    group.description = description || group.description;
    group.topics = topics || group.topics;
    group.isPrivate = isPrivate !== undefined ? isPrivate : group.isPrivate;

    await group.save();

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete study group
export const deleteStudyGroup = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;
    const groupId = req.params.groupId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const group = await StudyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Only owner can delete group
    if (group.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the group owner can delete the group',
      });
    }

    await StudyGroup.findByIdAndDelete(groupId);

    res.status(200).json({
      success: true,
      message: 'Study group deleted successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all study groups
export const getStudyGroups = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Add filters
    const filters: any = {};
    if (req.query.topic) {
      filters.topics = { $in: [req.query.topic] };
    }

    // Get public study groups by default
    const groups = await StudyGroup.find({
      isPrivate: false,
      ...filters
    })
      .populate('owner', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await StudyGroup.countDocuments({
      isPrivate: false,
      ...filters
    });

    res.status(200).json({
      success: true,
      count: groups.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: groups,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Add message to study group
export const addMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const { id } = req.params;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Check if user is a member of the group
    const userObjectId = toObjectId(userId.toString());
    if (!group.members.some(memberId => memberId.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    // Update the model to ensure messages field exists
    // This is a workaround, ideally the model should be updated to include messages
    if (!group.toObject().hasOwnProperty('messages')) {
      // Use updateOne to add the messages array field if it doesn't exist
      await StudyGroup.updateOne(
        { _id: id },
        { $set: { messages: [] } }
      );
    }
    
    // Add message using direct MongoDB update to avoid schema validation issues
    await StudyGroup.updateOne(
      { _id: id },
      { 
        $push: { 
          messages: {
            user: userObjectId,
            text: message,
            createdAt: new Date()
          }
        }
      }
    );

    // Retrieve the updated group
    const updatedGroup = await StudyGroup.findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(200).json({
      success: true,
      data: updatedGroup,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}; 