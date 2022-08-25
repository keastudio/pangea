import { generateManifest } from './src/generateManifest.js'
import { serve } from './src/serve.js'

async function runServe(metaUrl) {
  generateManifest()

  const { default: manifest } = await import(metaUrl.split('/').slice(0, -1).join('/') + '/pangea.gen.ts')

  await serve(manifest)
}

export { runServe }
