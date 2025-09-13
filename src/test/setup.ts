import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiUrl: 'http://localhost:3001',
    },
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  })),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

// Silence React Native warnings in tests
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
  ignoreLogs: jest.fn(),
  ignoreAllLogs: jest.fn(),
}));

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: (Component: any) => Component,
}));

// Global test utilities
(global as any).mockFetch = (response: any, options?: { status?: number }) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: options?.status !== undefined ? options.status < 400 : true,
      status: options?.status || 200,
      json: () => Promise.resolve(response),
    })
  ) as jest.Mock;
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});