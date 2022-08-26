#!/usr/bin/env -S deno run -A

import { runBuild } from '$pangea/runBuild.js'

runBuild(import.meta.url)
