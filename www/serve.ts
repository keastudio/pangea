#!/usr/bin/env -S deno run -A --watch=pages/

import { runServe } from '$pangea/runServe.js'
    
runServe(import.meta.url)
