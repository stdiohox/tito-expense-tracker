/*
 * Mocks shared by jest.setup.js and the flow tests. expo-router/testing-library registers its own
 * Reanimated mock when it is imported (which fails on Reanimated 4.7 and leaves an empty object),
 * so tests that use renderRouter register these again right after importing it.
 */
/*
 * Reanimated 4.7's own mock loads the real library, whose start-up throws outside a phone, so the
 * small part the app uses is mocked here. Animations jump straight to their end value and their
 * "finished" callbacks run at once, so flows that wait for an animation (closing a sheet) still work.
 */
function mockReanimated() {
  const React = require('react');
  const RN = jest.requireActual('react-native');

  // FadeInDown.delay(70).duration(380)... : any chain of builder calls.
  const builder = () => {
    const b = new Proxy(function () {}, {
      get: (_t, prop) => (prop === 'then' ? undefined : () => b),
      apply: () => b,
    });
    return b;
  };
  const shared = (initial) => {
    const s = {
      value: initial,
      get: () => s.value,
      set: (next) => {
        s.value = typeof next === 'function' ? next(s.value) : next;
      },
    };
    return s;
  };
  const withTiming = (to, _config, done) => {
    if (typeof done === 'function') done(true);
    return to;
  };
  const Animated = {
    View: RN.View,
    Text: RN.Text,
    ScrollView: RN.ScrollView,
    Image: RN.Image,
    createAnimatedComponent: (C) => C,
  };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    Easing: RN.Easing,
    FadeInDown: builder(),
    FadeOutDown: builder(),
    FadeIn: builder(),
    FadeOut: builder(),
    ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
    useSharedValue: (initial) => React.useRef(shared(initial)).current,
    useAnimatedStyle: (fn) => fn(),
    useAnimatedProps: (fn) => fn(),
    useReducedMotion: () => false,
    withTiming,
    withSpring: withTiming,
    withDelay: (_ms, value) => value,
    withRepeat: (value) => value,
    withSequence: (...values) => values[values.length - 1],
    cancelAnimation: () => {},
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
  };
}

function mockWorklets() {
  return {
  scheduleOnRN: (fn, ...args) => fn(...args),
  scheduleOnUI: (fn, ...args) => fn(...args),
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  };
}

module.exports = { mockReanimated, mockWorklets };
