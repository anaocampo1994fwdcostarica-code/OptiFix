export default {
  testEnvironment: "jsdom",
  setupFilesAfterEach: [],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss)$": "<rootDir>/src/test-utils/styleMock.js",
  },
};
