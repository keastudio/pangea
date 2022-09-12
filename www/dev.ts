#!/usr/bin/env -S deno run -A

import { dev } from '$pangea/dev.ts'

dev(import.meta.url)
