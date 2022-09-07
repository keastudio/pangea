#!/usr/bin/env -S deno run -A --watch=pages/

import { dev } from '$pangea/dev.ts'
    
dev(import.meta.url)
