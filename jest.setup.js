/* Jest setup (npm test). Mocks native-only pieces so screens render in Node. */
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const { mockReanimated, mockWorklets } = require('./jest.mocks');

jest.mock('react-native-reanimated', () => mockReanimated());
jest.mock('react-native-worklets', () => mockWorklets());
