// Learn more https://docs.expo.dev/guides/customizing-metro
// getSentryExpoConfig is Expo's getDefaultConfig plus the debug IDs Sentry uses to match crash
// reports to source maps (docs/SCALE-PLAN.md §7). It changes nothing in the app itself. Sentry's
// web session replay and feedback widget are left out: we never record screens.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname, { includeWebReplay: false, includeWebFeedback: false });

/*
 * expo-sqlite on the web (https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/): SQLite is a
 * WebAssembly file, and it runs in a worker that talks to the page through SharedArrayBuffer, which
 * browsers only allow on a cross-origin-isolated page. So: serve .wasm as an asset, and send the two
 * isolation headers from the dev server. Hosting the web build needs the same two headers
 * (public/_headers, public/serve.json and the expo-router plugin in app.json).
 */
config.resolver.assetExts.push('wasm');
const enhance = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const inner = enhance ? enhance(middleware, server) : middleware;
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return inner(req, res, next);
  };
};

/*
 * Cap how many Metro cache files are open at once.
 *
 * Expo's cache store reads and writes each cached transform with an unbounded fs.promises call,
 * and Metro asks for every module of a bundle at the same time (about 8,300 for this app). On
 * Windows a Node process can hold roughly 8,192 open files, and antivirus scanning (McAfee here)
 * keeps each one open longer, so a bundle served from a warm cache could fail with
 * "EMFILE: too many open files ... metro-cache". Queuing cache reads and writes keeps the number of
 * open cache files small however slow the disk is. The cache location and format are unchanged.
 * Harmless on macOS and Linux; Metro's own concurrency (maxWorkers) is left as it is.
 */
const MAX_OPEN_CACHE_FILES = 64;

function createLimiter(max) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= max || queue.length === 0) return;
    active += 1;
    const { task, resolve, reject } = queue.shift();
    Promise.resolve()
      .then(task)
      .then(resolve, reject)
      .finally(() => {
        active -= 1;
        next();
      });
  };
  return (task) =>
    new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject });
      next();
    });
}

const limit = createLimiter(MAX_OPEN_CACHE_FILES);

// Wrap each store: get and set go through the queue; everything else is passed straight through,
// bound to the real store (it uses private fields).
config.cacheStores = (config.cacheStores ?? []).map(
  (store) =>
    new Proxy(store, {
      get(target, prop) {
        if (prop === 'get' || prop === 'set') {
          return (...args) => limit(() => target[prop](...args));
        }
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    }),
);

module.exports = config;
