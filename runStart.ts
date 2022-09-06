import { generateManifest } from './src/generateManifest.ts'
import { serve } from './src/serve.ts'

async function runStart(metaUrl: string) {
  generateManifest()

  const { default: manifest } = await import(metaUrl.split('/').slice(0, -1).join('/') + '/pangea.gen.ts')

  await serve(manifest)
}

export { runStart }
