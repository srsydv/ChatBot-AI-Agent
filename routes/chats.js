const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { title } = req.body;

    const chat = await Chat.create({
      user: req.user.id,
      title: title || 'New Chat',
    });

    res.status(201).json({
      success: true,
      chat: {
        id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt,
      },
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt');

    res.json({
      success: true,
      chats: chats.map(chat => ({
        id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

router.get('/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const messages = await Message.find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .select('role content createdAt');

    res.json({
      success: true,
      chat: {
        id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

router.delete('/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

   
    await Message.deleteMany({ chat: chat._id });

    
    await Chat.deleteOne({ _id: chat._id });

    res.json({
      success: true,
      message: 'Chat deleted successfully',
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

router.put('/:chatId/title', protect, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const chat = await Chat.findOneAndUpdate(
      {
        _id: req.params.chatId,
        user: req.user.id,
      },
      { title: title.trim(), updatedAt: Date.now() },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({
      success: true,
      chat: {
        id: chat._id,
        title: chat.title,
      },
    });
  } catch (error) {
    console.error('Update chat title error:', error);
    res.status(500).json({ error: 'Failed to update chat title' });
  }
});

module.exports = router;
