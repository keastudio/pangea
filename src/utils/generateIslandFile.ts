import { denoPlugin } from 'https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts'
import globalExternals from 'https://esm.sh/@fal-works/esbuild-plugin-global-externals@2.1.2?pin=v92'

import { build, Plugin } from 'esbuild'

const generateIslandFile = async (path: string) => {
  const { outputFiles } = await build({
    bundle: true,
    entryPoints: [path],
    format: 'esm',
    jsxFactory: 'React.createElement',
    plugins: [
      <Plugin>globalExternals(
        {
          react: 'React'
        }
      ),
      denoPlugin({ importMapURL: new URL(`file://${Deno.cwd()}/import_map.json`) })
    ],
    write: false,
    minify: true
  })

  return `import{React}from'./shared.js';${outputFiles[0].text}`
}

export { generateIslandFile }
