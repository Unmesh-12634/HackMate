import mongoose from 'mongoose';
import env from './env';

export async function connectToDatabase(): Promise<void> {
  if (!env.mongoUri) {
    console.warn('[DB] MONGO_URI is empty. Skipping DB connect.');
    return;
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri, {
      // Additional options can be placed here in future
    });
    console.log('[DB] Connected');

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] Disconnected');
    });
    mongoose.connection.on('error', (error) => {
      console.error('[DB] Error', error);
    });
  } catch (error) {
    console.error('[DB] Initial connection failed:', error);
    // Do not throw to allow the server to start; Mongoose will buffer by default
  }
}