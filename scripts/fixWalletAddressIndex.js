const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-agent');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const fixIndex = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // Check if the index exists
    const indexes = await collection.indexes();
    const walletIndex = indexes.find(idx => idx.name === 'wallet_address_1');
    
    if (walletIndex) {
      console.log('Found wallet_address index, dropping it...');
      await collection.dropIndex('wallet_address_1');
      console.log('Successfully dropped wallet_address index');
    } else {
      console.log('No wallet_address index found');
    }
    
    mongoose.connection.close();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing index:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

fixIndex();
