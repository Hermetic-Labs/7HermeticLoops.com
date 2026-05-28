// remark-gfm ships types (index.d.ts) but its package.json "exports"
// field doesn't declare a "types" condition, so TypeScript's "bundler"
// module resolution can't find them automatically. This shim re-exports
// the actual types so the import resolves cleanly.
declare module 'remark-gfm' {
  import type { Plugin } from 'unified';

  interface Options {
    singleTilde?: boolean;
  }

  const remarkGfm: Plugin<[Options?]>;
  export default remarkGfm;
}
