// src/config/mongo.connection.ts
import mongoose from 'mongoose';
import { keys } from './keys';
import { AppLogger } from './logger';

export async function connectMongoDB() {
  const logger = new AppLogger();
  try {
    await mongoose.connect(keys.MONGO_URI as string);
    console.log('✅ MongoDB Connected Successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
}

// Opcional: Función para cerrar la conexión
export async function disconnectMongoDB() {
  try {
    await mongoose.disconnect();
    console.log('📴 MongoDB Disconnected');
  } catch (error) {
    console.error('❌ MongoDB Disconnection Error:', error);
  }
}

// Manejo de eventos de conexión (opcional pero recomendado)
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB Connection Established');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 MongoDB Connection Error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔵 MongoDB Connection Closed');
});