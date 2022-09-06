#!/usr/bin/env -S deno run -A --watch=pages/

import { runStart } from '$pangea/runStart.ts'

runStart(import.meta.url)
