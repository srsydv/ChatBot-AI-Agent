const express = require('express');
const router = express.Router();
const { generateChatCompletion, formatMessages } = require('../services/openaiService');
const { protect, optionalAuth } = require('../middleware/auth');
const Message = require('../models/Message');
const Chat = require('../models/Chat');


router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});


router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, chatId, conversationHistory = [], options = {} } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string',
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.',
      });
    }

    const formattedMessages = formatMessages(conversationHistory, message.trim());
    const response = await generateChatCompletion(formattedMessages, options);

    // Logged-in user: require chatId and save messages
    if (req.user) {
      if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required when logged in' });
      }
      const chat = await Chat.findOne({
        _id: chatId,
        user: req.user.id,
      });
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      await Message.create({
        chat: chatId,
        role: 'user',
        content: message.trim(),
      });
      await Message.create({
        chat: chatId,
        role: 'assistant',
        content: response.content,
      });
      chat.updatedAt = Date.now();
      await chat.save();
    }
    // Guest: no save, just return the response

    res.json({
      role: response.role,
      content: response.content,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat error:', error);

    if (error.status === 401) {
      return res.status(401).json({
        error: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file.',
      });
    }
    if (error.status === 429) {
      return res.status(429).json({
        error: 'OpenAI API rate limit exceeded. Please try again later.',
      });
    }

    res.status(500).json({
      error: error.message || 'Failed to process chat message',
    });
  }
});

module.exports = router;
