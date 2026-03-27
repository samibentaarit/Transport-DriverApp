module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|react-navigation|@react-navigation/.*|@tanstack/.*|zustand)"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"]
};

