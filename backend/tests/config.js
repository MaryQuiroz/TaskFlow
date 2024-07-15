const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Función para conectar a la base de datos de test
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/taskflow_test');
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Función para limpiar la base de datos después de los tests
const clearDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
};

// Función para cerrar la conexión
const closeDB = async () => {
  await mongoose.connection.close();
};

module.exports = {
  connectDB,
  clearDB,
  closeDB
};
