const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateChatCompletion = async (messages, options = {}) => {
  try {
    const {
      model = 'gpt-4.1-nano',
      temperature = 0.7,
      max_tokens = 3000,
      ...otherOptions
    } = options;

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      ...otherOptions,
    });

    return {
      role: 'assistant',
      content: completion.choices[0].message.content,
      usage: completion.usage,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(
      error.message || 'Failed to generate chat completion'
    );
  }
};

const formatMessages = (conversationHistory = [], newMessage) => {
  const messages = [];

  // Add system message if needed (you can customize this)
  messages.push({
    role: 'system',
    content: 'You are Merlin, a helpful AI assistant specializing in crypto trading insights and analysis. Provide clear, concise, and informative responses.',
  });

 
  conversationHistory.forEach((msg) => {
    if (msg.role && msg.content) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  });

 
  messages.push({
    role: 'user',
    content: newMessage,
  });

  return messages;
};

module.exports = {
  generateChatCompletion,
  formatMessages,
};
