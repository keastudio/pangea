import { generateManifest } from './src/generateManifest.js'
import { build } from './src/build.js'

async function runBuild (metaUrl) {
  generateManifest()

  const { default: manifest } = await import(metaUrl.split('/').slice(0, -1).join('/') + '/pangea.gen.ts')

  await build(manifest)
}

export { runBuild }
