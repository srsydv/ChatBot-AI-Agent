const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

chatSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Index for listing a user's chats sorted by updatedAt (avoids full collection scan + in-memory sort)
chatSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
