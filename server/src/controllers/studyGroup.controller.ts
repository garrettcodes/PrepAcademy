import { Request, Response } from 'express';
import StudyGroup from '../models/studyGroup.model';
import User from '../models/user.model';
import { generateRandomCode } from '../utils/helpers';

// Create a new study group
export const createStudyGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, topics, isPrivate } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Generate a random join code for private groups
    const joinCode = isPrivate ? generateRandomCode(8) : null;

    const studyGroup = await StudyGroup.create({
      name,
      description,
      owner: userId,
      members: [userId], // Add the creator as a member
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
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const groups = await StudyGroup.find({
      members: userId,
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single study group
export const getStudyGroup = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

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
    if (group.isPrivate && !group.members.some(member => member._id.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this private group',
      });
    }

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

// Join a study group
export const joinStudyGroup = async (req: Request, res: Response) => {
  try {
    const { groupId, joinCode } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const group = await StudyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Check if already a member
    if (group.members.includes(userId)) {
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
    group.members.push(userId);
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
    const groupId = req.params.groupId;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const group = await StudyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Cannot leave if you're the owner
    if (group.owner.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Group owner cannot leave the group. You must delete the group or transfer ownership.',
      });
    }

    // Check if user is a member
    if (!group.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    // Remove user from members
    group.members = group.members.filter(
      member => member.toString() !== userId.toString()
    );
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left the study group',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update study group
export const updateStudyGroup = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user?._id;
    const { name, description, topics, isPrivate } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
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
    const groupId = req.params.groupId;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
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