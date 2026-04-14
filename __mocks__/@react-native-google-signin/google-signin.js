const mockUser = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    photo: null,
    familyName: 'User',
    givenName: 'Test',
  },
};

module.exports = {
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() =>
      Promise.resolve({
        type: 'success',
        data: {
          ...mockUser,
          scopes: [],
          idToken: null,
          serverAuthCode: null,
        },
      }),
    ),
    signInSilently: jest.fn(() =>
      Promise.resolve({ type: 'noSavedCredentialFound', data: null }),
    ),
    addScopes: jest.fn(() =>
      Promise.resolve({
        type: 'success',
        data: {
          ...mockUser,
          scopes: [],
          idToken: null,
          serverAuthCode: null,
        },
      }),
    ),
    signOut: jest.fn(() => Promise.resolve(null)),
    getTokens: jest.fn(() =>
      Promise.resolve({ accessToken: 'mock-token', idToken: 'mock-id' }),
    ),
    getCurrentUser: jest.fn(() => mockUser),
  },
};
