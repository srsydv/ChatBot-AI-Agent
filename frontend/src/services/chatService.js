// Chat API service
export const chatService = {
  // Create a new chat
  async createChat(title = 'New Chat', token) {
    const response = await fetch('/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create chat');
    }

    return await response.json();
  },

  // Get all chats for the current user
  async getChats(token) {
    const response = await fetch('/api/chats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch chats');
    }

    return await response.json();
  },

  // Get a specific chat with all messages
  async getChat(chatId, token) {
    const response = await fetch(`/api/chats/${chatId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch chat');
    }

    return await response.json();
  },

  // Delete a chat
  async deleteChat(chatId, token) {
    const response = await fetch(`/api/chats/${chatId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to delete chat');
    }

    return await response.json();
  },

  // Update chat title
  async updateChatTitle(chatId, title, token) {
    const response = await fetch(`/api/chats/${chatId}/title`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update chat title');
    }

    return await response.json();
  },
};
