#!/usr/bin/env -S deno run -A --watch=static/,routes/

import * as $0 from './src/pages/index.jsx'

import { serve } from "$pangea/serve.js"

await serve({
  pages: {
    './src/pages/index.jsx': $0
  }
})
