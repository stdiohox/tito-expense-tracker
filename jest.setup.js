/* Jest setup (npm test). Mocks native-only pieces so screens render in Node. */
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const { mockReanimated, mockWorklets } = require('./jest.mocks');

jest.mock('react-native-reanimated', () => mockReanimated());
jest.mock('react-native-worklets', () => mockWorklets());

// Expense ids come from expo-crypto; its automatic mock returns nothing, so use Node's.
jest.mock('expo-crypto', () => ({
  ...jest.requireActual('expo-crypto'),
  randomUUID: () => require('node:crypto').randomUUID(),
}));
