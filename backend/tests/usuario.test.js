/**
 * Pruebas de las reglas de validación del modelo Usuario relacionadas
 * con Google OAuth: cédula/contraseña se vuelven opcionales solo para
 * admins autenticados con Google, no para los demás casos.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { conectarDbDePrueba, limpiarDbDePrueba, cerrarDbDePrueba } from "./setup-db.js";
import Usuario from "../models/Usuario.js";

beforeAll(async () => {
  await conectarDbDePrueba();
});

afterAll(async () => {
  await cerrarDbDePrueba();
});

beforeEach(async () => {
  await limpiarDbDePrueba();
});

describe("Usuario — reglas de Google OAuth", () => {
  it("permite crear un admin de Google SIN cédula ni contraseña", async () => {
    const admin = await Usuario.create({
      nombre: "Admin Google " + Date.now(),
      email: `admin${Date.now()}@gmail.com`,
      rol: "admin",
      esGoogleAuth: true,
      googleId: "google-id-123",
      estado: "activo",
    });

    expect(admin._id).toBeDefined();
    expect(admin.cedula).toBeUndefined();
  });

  it("rechaza un CIUDADANO sin cédula, incluso si dice ser de Google", async () => {
    await expect(
      Usuario.create({
        nombre: "Ciudadano Google " + Date.now(),
        email: `ciudadano${Date.now()}@gmail.com`,
        rol: "ciudadano",
        esGoogleAuth: true,
        password: undefined,
      }),
    ).rejects.toThrow();
  });

  it("rechaza un admin TRADICIONAL (no Google) sin contraseña", async () => {
    await expect(
      Usuario.create({
        nombre: "Admin Tradicional " + Date.now(),
        email: `admintrad${Date.now()}@ejemplo.com`,
        rol: "admin",
        esGoogleAuth: false,
        // sin password
      }),
    ).rejects.toThrow();
  });

  it("exige email válido para cualquier admin", async () => {
    await expect(
      Usuario.create({
        nombre: "Admin Sin Email " + Date.now(),
        rol: "admin",
        esGoogleAuth: true,
        googleId: "google-id-456",
      }),
    ).rejects.toThrow();
  });
});