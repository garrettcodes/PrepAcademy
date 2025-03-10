import { Request, Response } from 'express';
import SharedNote from '../models/sharedNote.model';
import StudyGroup from '../models/studyGroup.model';

// Create a new shared note
export const createSharedNote = async (req: Request, res: Response) => {
  try {
    const { title, content, subject, topic, tags, visibility, studyGroupId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // If visibility is set to 'group', check if studyGroupId is provided
    if (visibility === 'group' && !studyGroupId) {
      return res.status(400).json({
        success: false,
        message: 'Study group ID is required for group visibility',
      });
    }

    // If sharing with a group, check if user is a member
    if (visibility === 'group' && studyGroupId) {
      const group = await StudyGroup.findById(studyGroupId);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Study group not found',
        });
      }

      // Check if user is a member of the group
      if (!group.members.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this group',
        });
      }
    }

    const sharedNote = await SharedNote.create({
      title,
      content,
      author: userId,
      subject,
      topic,
      tags: tags || [],
      visibility,
      studyGroup: visibility === 'group' ? studyGroupId : null,
    });

    res.status(201).json({
      success: true,
      data: sharedNote,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all public shared notes with pagination and filters
export const getPublicSharedNotes = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const subject = req.query.subject as string;
    const topic = req.query.topic as string;
    const tag = req.query.tag as string;
    
    // Build filter object
    let filter: any = { visibility: 'public' };
    
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (tag) filter.tags = { $in: [tag] };

    const notes = await SharedNote.find(filter)
      .populate('author', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await SharedNote.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: notes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: notes,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all notes shared in a specific study group
export const getGroupSharedNotes = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Check if the user is a member of the group
    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    if (!group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    const notes = await SharedNote.find({
      studyGroup: groupId,
      visibility: 'group',
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's own notes
export const getUserNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const notes = await SharedNote.find({
      author: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single note by ID
export const getSharedNote = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.noteId;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const note = await SharedNote.findById(noteId)
      .populate('author', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email',
      });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Check access permissions
    if (note.visibility === 'private' && note.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this note',
      });
    }

    if (note.visibility === 'group') {
      // Check if user is a member of the group
      const group = await StudyGroup.findById(note.studyGroup);
      
      if (!group || !group.members.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this note',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a note
export const updateSharedNote = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.noteId;
    const userId = req.user?._id;
    const { title, content, subject, topic, tags, visibility, studyGroupId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const note = await SharedNote.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Only author can update the note
    if (note.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this note',
      });
    }

    // If changing visibility to 'group', check if studyGroupId is provided
    if (visibility === 'group' && !studyGroupId) {
      return res.status(400).json({
        success: false,
        message: 'Study group ID is required for group visibility',
      });
    }

    // If sharing with a group, check if user is a member
    if (visibility === 'group' && studyGroupId) {
      const group = await StudyGroup.findById(studyGroupId);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Study group not found',
        });
      }

      // Check if user is a member of the group
      if (!group.members.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this group',
        });
      }
    }

    // Update fields
    note.title = title || note.title;
    note.content = content || note.content;
    note.subject = subject || note.subject;
    note.topic = topic || note.topic;
    note.tags = tags || note.tags;
    note.visibility = visibility || note.visibility;
    note.studyGroup = visibility === 'group' ? studyGroupId : null;

    await note.save();

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a note
export const deleteSharedNote = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.noteId;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const note = await SharedNote.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Only author can delete the note
    if (note.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this note',
      });
    }

    await SharedNote.findByIdAndDelete(noteId);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Add a comment to a note
export const addComment = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.noteId;
    const userId = req.user?._id;
    const { text } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    const note = await SharedNote.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Check access permissions
    if (note.visibility === 'private' && note.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to comment on this note',
      });
    }

    if (note.visibility === 'group') {
      // Check if user is a member of the group
      const group = await StudyGroup.findById(note.studyGroup);
      
      if (!group || !group.members.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to comment on this note',
        });
      }
    }

    // Add comment
    note.comments.push({
      user: userId,
      text,
      createdAt: new Date(),
    });

    await note.save();

    const updatedNote = await SharedNote.findById(noteId)
      .populate('author', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email',
      });

    res.status(200).json({
      success: true,
      data: updatedNote,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Vote on a note (upvote or downvote)
export const voteOnNote = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.noteId;
    const userId = req.user?._id;
    const { voteType } = req.body; // 'upvote' or 'downvote'

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Vote type must be either "upvote" or "downvote"',
      });
    }

    const note = await SharedNote.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Check access permissions
    if (note.visibility === 'private' && note.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to vote on this note',
      });
    }

    if (note.visibility === 'group') {
      // Check if user is a member of the group
      const group = await StudyGroup.findById(note.studyGroup);
      
      if (!group || !group.members.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to vote on this note',
        });
      }
    }

    // Check if user is trying to vote on their own note
    if (note.author.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote on your own note',
      });
    }

    // Remove any existing votes by this user
    note.upvotes = note.upvotes.filter(id => id.toString() !== userId.toString());
    note.downvotes = note.downvotes.filter(id => id.toString() !== userId.toString());

    // Add the new vote
    if (voteType === 'upvote') {
      note.upvotes.push(userId);
    } else {
      note.downvotes.push(userId);
    }

    await note.save();

    res.status(200).json({
      success: true,
      message: `Note ${voteType}d successfully`,
      data: {
        upvotes: note.upvotes.length,
        downvotes: note.downvotes.length,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}; 