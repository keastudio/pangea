#!/usr/bin/env -S deno run -A --watch=static/,routes/

import { serve } from '$pangea/serve.js'
import manifest from './pangea.gen.ts'

await serve(manifest)
