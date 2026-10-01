export default {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/src/test-utils/setupTests.js"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss)$": "<rootDir>/src/test-utils/styleMock.js",
    "\\.(png|jpe?g|gif|webp|svg)$": "<rootDir>/src/test-utils/fileMock.js",
  },
  // Cobertura exigible sobre la capa crÃ­tica verificable: seguridad, lÃ³gica y CRUD HTTP.
  // Las vistas extensas se validan mediante pruebas de integraciÃ³n separadas.
  collectCoverageFrom: [
    "src/context/AuthContext.jsx",
    "src/components/ProtectedRoute.jsx",
    "src/services/{ordenes,usuarios,clientes,equipos,productos,servicios,cotizaciones}Service.js",
    "src/utils/{calculos,estadoColors}.js",
  ],
  coverageThreshold: {
    global: { statements: 80, lines: 80, functions: 80 },
  },
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Reporte de Pruebas - OptiFix",
        outputPath: "./reports/test-report.html",
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
  ],
};
