/**
 * Helper compartido por los tests: levanta una MongoDB en memoria
 * (no toca tu base de datos real) y la conecta con Mongoose.
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer;

export const conectarDbDePrueba = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

export const limpiarDbDePrueba = async () => {
  const colecciones = mongoose.connection.collections;
  for (const key in colecciones) {
    await colecciones[key].deleteMany({});
  }
};

export const cerrarDbDePrueba = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};