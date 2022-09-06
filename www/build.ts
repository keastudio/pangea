#!/usr/bin/env -S deno run -A

import { runBuild } from '$pangea/runBuild.ts'

runBuild(import.meta.url)
