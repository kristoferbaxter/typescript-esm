# Typescript ESM

This project aims to make it more straightforward to output valid '.mjs' content from an existing TypeScript Project. All work is done post TypeScript compilation to avoid wrapping the TypeScript API.

### Input
```bash
tsc -p tsconfig.json
```

This is likely how you're configuring TypeScript to execute if you're looking at using this package. Right now when using the TypeScript Compiler directly, your output will be '.js' files.

### Usage
```bash
tsc -p tsconfig.json; tsc-esm -p tsconfig.json
```

When you add the `tsc-esm` compiler following the conclusion of TypeScript's output, this compiler will remap all generated files to use '.mjs' extensions for locally resolved items and rename every output's extension to '.mjs'.

### Example
**direct.ts** in a TypeScript Project.

**Before** direct.js
```typescript
import {imported} from './imported';

type Bar = string;

export default function() {
  const bar: Bar = 'bar';
  console.log(bar);
  imported();
}
```

**After** direct.mjs
```javascript
import { imported } from './imported.mjs';
export default function () {
  const bar = 'bar';
  console.log(bar);
  imported();
}
```

### For Contributors
[Volta](https://docs.volta.sh/guide/getting-started) is highly recommended to keep the node version and yarn version synced with other contributors.
