module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@react-native-google-signin/google-signin$':
      '<rootDir>/__mocks__/@react-native-google-signin/google-signin.js',
    '^@react-native-google-signin/google-signin/lib/module/signIn/GoogleSignin\\.js$':
      '<rootDir>/__mocks__/@react-native-google-signin/google-signin.js',
    '^@invertase/react-native-apple-authentication$':
      '<rootDir>/__mocks__/@invertase/react-native-apple-authentication.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-native-community|react-native-css-interop|nativewind|@react-native-async-storage)/)',
  ],
};
