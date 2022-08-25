#!/usr/bin/env -S deno run -A --watch=static/,routes/

import { serve } from "$pangea/serve.js"

await serve()
