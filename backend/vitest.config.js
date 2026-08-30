import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Los tests de integración con MongoDB en memoria pueden tardar un
    // poco más en el primer arranque (descarga el binario de mongod).
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});