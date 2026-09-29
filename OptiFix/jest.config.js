export default {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/src/test-utils/setupTests.js"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss)$": "<rootDir>/src/test-utils/styleMock.js",
  },
};
