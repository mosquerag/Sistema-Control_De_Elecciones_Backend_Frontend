/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: db.js
 * UBICACIÓN: /backend/utils/db.js
 * DESCRIPCIÓN: Configuración y conexión a MongoDB
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FUNCIÓN:
 * - Establece conexión con MongoDB
 * - Configura opciones de Mongoose
 * - Maneja eventos de conexión
 * - Implementa retry logic
 * - Proporciona logging detallado
 * 
 * DEPENDE DE:
 * - mongoose (ODM para MongoDB)
 * - process.env.MONGO (URL de conexión)
 * 
 * ES USADO POR:
 * - /backend/index.js (servidor principal)
 */

import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE MONGOOSE
// ═══════════════════════════════════════════════════════════════════════

mongoose.set('strictQuery', false);

if (process.env.MONGOOSE_DEBUG === 'true' && process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
  console.log('🔍 Mongoose debug mode habilitado');
}

// ═══════════════════════════════════════════════════════════════════════
// OPCIONES DE CONEXIÓN
// ═══════════════════════════════════════════════════════════════════════

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  autoIndex: process.env.NODE_ENV === 'development',
  w: 'majority',
  retryWrites: true,
  readPreference: 'primary',
};

// ═══════════════════════════════════════════════════════════════════════
// FUNCIÓN DE CONEXIÓN
// ═══════════════════════════════════════════════════════════════════════

const connectDB = async () => {
  try {
    if (!process.env.MONGO) {
      throw new Error('❌ Variable MONGO no está definida en .env');
    }

    console.log('🔄 Conectando a MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGO, options);

    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    console.log(`🔢 Puerto: ${conn.connection.port}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔗 Estado de conexión: ${mongoose.connection.readyState}`);
      console.log(`📦 Versión de Mongoose: ${mongoose.version}`);
    }

  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Detalles del error:', error);
    }

    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Sugerencias:');
      console.error('   1. Verifica que MongoDB esté corriendo');
      console.error('   2. Verifica la URL de conexión en .env');
      console.error('   3. Si usas MongoDB Atlas, verifica la whitelist de IPs\n');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Sugerencias:');
      console.error('   1. Verifica el usuario y contraseña en la URL de MongoDB');
      console.error('   2. Verifica que el usuario tenga permisos en la base de datos\n');
    } else if (error.message.includes('MONGO no está definida')) {
      console.error('\n💡 Sugerencias:');
      console.error('   1. Crea un archivo .env en la raíz del backend');
      console.error('   2. Agrega la variable: MONGO=mongodb://localhost:27017/nombre_bd');
      console.error('   3. Puedes usar .env.example como referencia\n');
    }

    process.exit(1);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// EVENT LISTENERS DE MONGOOSE
// ═══════════════════════════════════════════════════════════════════════

mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose: Conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose: Error de conexión:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose: Desconectado de MongoDB');
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Intentando reconectar...');
    setTimeout(() => {
      mongoose.connect(process.env.MONGO, options);
    }, 5000);
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('🟢 Mongoose: Reconectado a MongoDB');
});

mongoose.connection.on('close', () => {
  console.log('⚫ Mongoose: Conexión cerrada');
});

// ═══════════════════════════════════════════════════════════════════════
// MANEJO DE CIERRE GRACEFUL
// ═══════════════════════════════════════════════════════════════════════

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 Conexión a MongoDB cerrada por cierre de aplicación');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al cerrar conexión:', err);
    process.exit(1);
  }
});

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════

export default connectDB;