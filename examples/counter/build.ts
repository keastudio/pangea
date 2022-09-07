#!/usr/bin/env -S deno run -A

import { build } from '$pangea/build.ts'

build(import.meta.url)
