/**
 * Prueba crítica: un mismo ciudadano NO puede votar dos veces
 * en la misma elección (índice único idCiudadano + idEleccion).
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import {
  conectarDbDePrueba,
  limpiarDbDePrueba,
  cerrarDbDePrueba,
} from "./setup-db.js";
import Voto from "../models/Voto.js";
import TipoEleccion from "../models/TipoEleccion.js";
import Eleccion from "../models/Eleccion.js";

beforeAll(async () => {
  await conectarDbDePrueba();
});

afterAll(async () => {
  await cerrarDbDePrueba();
});

beforeEach(async () => {
  await limpiarDbDePrueba();
});

/** Crea una elección mínima válida para usar en los tests */
const crearEleccionDePrueba = async () => {
  const tipo = await TipoEleccion.create({
    nombre: "Presidencial " + Math.random().toString(36).slice(2),
  });
  return Eleccion.create({
    titulo: "Elección de prueba " + Math.random().toString(36).slice(2),
    idTipoEleccion: tipo._id,
    fechaInicio: new Date(Date.now() - 1000 * 60 * 60), // empezó hace 1h
    fechaFin: new Date(Date.now() + 1000 * 60 * 60), // termina en 1h
  });
};

describe("Voto — prevención de doble votación", () => {
  it("permite registrar un voto la primera vez", async () => {
    const eleccion = await crearEleccionDePrueba();
    const idCiudadano = new mongoose.Types.ObjectId();

    const voto = await Voto.create({ idCiudadano, idEleccion: eleccion._id });

    expect(voto._id).toBeDefined();
  });

  it("rechaza un segundo voto del mismo ciudadano en la misma elección", async () => {
    const eleccion = await crearEleccionDePrueba();
    const idCiudadano = new mongoose.Types.ObjectId();

    await Voto.create({ idCiudadano, idEleccion: eleccion._id });

    // El segundo intento debe fallar por el índice único de Mongo
    await expect(
      Voto.create({ idCiudadano, idEleccion: eleccion._id }),
    ).rejects.toThrow();
  });

  it("permite que el mismo ciudadano vote en DOS elecciones distintas", async () => {
    const eleccion1 = await crearEleccionDePrueba();
    const eleccion2 = await crearEleccionDePrueba();
    const idCiudadano = new mongoose.Types.ObjectId();

    await Voto.create({ idCiudadano, idEleccion: eleccion1._id });
    const segundoVoto = await Voto.create({
      idCiudadano,
      idEleccion: eleccion2._id,
    });

    expect(segundoVoto._id).toBeDefined();
  });
});