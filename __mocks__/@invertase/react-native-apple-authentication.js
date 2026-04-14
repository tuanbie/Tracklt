module.exports = {
  appleAuth: {
    isSupported: false,
    Operation: { LOGIN: 1 },
    Scope: { EMAIL: 0, FULL_NAME: 1 },
    performRequest: jest.fn(),
  },
};
