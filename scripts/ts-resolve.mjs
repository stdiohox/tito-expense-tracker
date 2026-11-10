// Lets plain `node` run the app's TypeScript domain files, which import siblings without an
// extension ("./dates"). Node 24 strips the types itself; this only adds the ".ts".
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, next) {
    if ((specifier.startsWith('./') || specifier.startsWith('../')) && !/\.[cm]?[jt]s$/.test(specifier)) {
      try {
        return next(`${specifier}.ts`, context);
      } catch {
        /* fall through to the default resolution */
      }
    }
    return next(specifier, context);
  },
});
