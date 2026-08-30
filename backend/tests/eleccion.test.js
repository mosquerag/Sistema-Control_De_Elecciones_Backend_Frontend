/**
 * Prueba: una elección con votos registrados no debe permitir cambiar
 * sus fechas ni su tipo (protección agregada en updateEleccion).
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

const crearEleccionDePrueba = async () => {
  const tipo = await TipoEleccion.create({
    nombre: "Presidencial " + Math.random().toString(36).slice(2),
  });
  return Eleccion.create({
    titulo: "Elección de prueba " + Math.random().toString(36).slice(2),
    idTipoEleccion: tipo._id,
    fechaInicio: new Date(Date.now() - 1000 * 60 * 60),
    fechaFin: new Date(Date.now() + 1000 * 60 * 60),
  });
};

/**
 * Replica exactamente la regla que agregamos en updateEleccion:
 * si hay votos, no se pueden tocar fechaInicio/fechaFin/idTipoEleccion.
 * (Se prueba la regla de negocio directamente sobre los modelos,
 * sin necesidad de levantar el servidor Express completo.)
 */
const intentarActualizarEleccion = async (idEleccion, cambios) => {
  const camposCriticos = ["fechaInicio", "fechaFin", "idTipoEleccion"];
  const intentaCambiarCritico = camposCriticos.some((campo) =>
    Object.prototype.hasOwnProperty.call(cambios, campo),
  );

  if (intentaCambiarCritico) {
    const totalVotos = await Voto.countDocuments({ idEleccion });
    if (totalVotos > 0) {
      throw new Error("ELECTION_HAS_VOTES");
    }
  }

  return Eleccion.findByIdAndUpdate(idEleccion, { $set: cambios }, { new: true });
};

describe("Eleccion — protección de campos críticos con votos existentes", () => {
  it("permite cambiar las fechas si la elección NO tiene votos", async () => {
    const eleccion = await crearEleccionDePrueba();
    const nuevaFecha = new Date(Date.now() + 1000 * 60 * 60 * 5);

    const actualizada = await intentarActualizarEleccion(eleccion._id, {
      fechaFin: nuevaFecha,
    });

    expect(actualizada.fechaFin.getTime()).toBe(nuevaFecha.getTime());
  });

  it("bloquea cambiar fechaFin si la elección YA tiene votos", async () => {
    const eleccion = await crearEleccionDePrueba();
    await Voto.create({
      idCiudadano: new mongoose.Types.ObjectId(),
      idEleccion: eleccion._id,
    });

    await expect(
      intentarActualizarEleccion(eleccion._id, {
        fechaFin: new Date(Date.now() + 1000 * 60 * 60 * 5),
      }),
    ).rejects.toThrow("ELECTION_HAS_VOTES");
  });

  it("SÍ permite editar campos no críticos (ej. descripción) aunque tenga votos", async () => {
    const eleccion = await crearEleccionDePrueba();
    await Voto.create({
      idCiudadano: new mongoose.Types.ObjectId(),
      idEleccion: eleccion._id,
    });

    const actualizada = await intentarActualizarEleccion(eleccion._id, {
      descripcion: "Descripción corregida",
    });

    expect(actualizada.descripcion).toBe("Descripción corregida");
  });
});