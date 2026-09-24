export default {
  testEnvironment: "jsdom",
  setupFilesAfterEach: [],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss)$": "<rootDir>/src/__tests__/styleMock.js",
  },
};
