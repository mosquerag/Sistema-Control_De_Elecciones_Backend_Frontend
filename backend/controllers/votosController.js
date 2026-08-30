import mongoose from "mongoose";
import Voto from "../models/Voto.js";
import VotoAnonimo from "../models/VotoAnonimo.js";
import Usuario from "../models/Usuario.js";
import Eleccion from "../models/Eleccion.js";

const isProduction = process.env.NODE_ENV === "production";

export const createVoto = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { idEleccion, idCandidato } = req.body;
    const idCiudadano = req.user._id;

    if (!idEleccion || !idCandidato) {
      return res.status(400).json({
        success: false,
        message: "idEleccion e idCandidato son obligatorios",
        error: "MISSING_FIELDS",
      });
    }

    const eleccion = await Eleccion.findById(idEleccion);
    if (!eleccion) {
      return res.status(404).json({
        success: false,
        message: "Elección no encontrada",
        error: "ELECTION_NOT_FOUND",
      });
    }

    const ahora = new Date();
    if (
      ahora < eleccion.fechaInicio ||
      ahora > eleccion.fechaFin ||
      !eleccion.activa
    ) {
      return res.status(400).json({
        success: false,
        message: "La elección no está activa en este momento",
        error: "ELECTION_NOT_ACTIVE",
      });
    }

    const candidato = await Usuario.findOne({
      _id: idCandidato,
      rol: "candidato",
      idEleccion,
      activo: true,
    });

    if (!candidato) {
      return res.status(400).json({
        success: false,
        message: "Candidato no válido para esta elección",
        error: "INVALID_CANDIDATE",
      });
    }

    let nuevoVoto;

    await session.withTransaction(async () => {
      // Registro anti-fraude: prueba que esta cédula ya votó (sin candidato)
      const votos = await Voto.create(
        [
          {
            idCiudadano,
            idEleccion,
            ipAddress: req.ip,
          },
        ],
        { session },
      );
      nuevoVoto = votos[0];

      // Conteo anónimo: prueba que este candidato recibió un voto (sin ciudadano)
      await VotoAnonimo.create(
        [
          {
            idEleccion,
            idCandidato,
          },
        ],
        { session },
      );

      await Usuario.findByIdAndUpdate(
        idCandidato,
        { $inc: { totalVotos: 1 } },
        { session },
      );
      await Eleccion.findByIdAndUpdate(
        idEleccion,
        { $inc: { totalVotantes: 1 } },
        { session },
      );
    });

    return res.status(201).json({
      success: true,
      message: "¡Tu voto ha sido registrado exitosamente!",
      data: { id: nuevoVoto._id, fechaVoto: nuevoVoto.fechaVoto },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Ya has votado en esta elección.",
        error: "DUPLICATE_VOTE",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error al registrar voto",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  } finally {
    session.endSession();
  }
};

export const checkVoto = async (req, res) => {
  try {
    const voto = await Voto.findOne({
      idCiudadano: req.user._id,
      idEleccion: req.params.idEleccion,
    });
    res.json({ success: true, data: { yaVoto: !!voto, voto: voto || null } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al verificar voto",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const getMisVotos = async (req, res) => {
  try {
    // Solo prueba de participación (elección + fecha) — el sistema
    // mismo no sabe por quién votó cada ciudadano.
    const votos = await Voto.find({ idCiudadano: req.user._id })
      .populate("idEleccion", "titulo descripcion estado")
      .sort({ fechaVoto: -1 });
    res.json({ success: true, total: votos.length, data: votos });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener historial de votos",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const getVotos = async (req, res) => {
  try {
    // Lista de quién votó y cuándo — nunca por quién
    const votos = await Voto.find()
      .populate("idCiudadano", "nombre cedula")
      .populate("idEleccion", "titulo")
      .sort({ fechaVoto: -1 });
    res.json({ success: true, total: votos.length, data: votos });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener votos",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const getVotosByEleccion = async (req, res) => {
  try {
    const votos = await Voto.find({ idEleccion: req.params.idEleccion })
      .populate("idCiudadano", "nombre cedula")
      .sort({ fechaVoto: -1 });
    res.json({ success: true, total: votos.length, data: votos });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener votos de la elección",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const getVotoById = async (req, res) => {
  try {
    const voto = await Voto.findById(req.params.id)
      .populate("idCiudadano", "nombre cedula")
      .populate("idEleccion", "titulo");

    if (!voto) {
      return res.status(404).json({
        success: false,
        message: "Voto no encontrado",
        error: "NOT_FOUND",
      });
    }

    res.json({ success: true, data: voto });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener voto",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export default {
  createVoto,
  checkVoto,
  getMisVotos,
  getVotos,
  getVotosByEleccion,
  getVotoById,
};