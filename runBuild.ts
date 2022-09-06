import { generateManifest } from './src/generateManifest.ts'
import { build } from './src/build.ts'

async function runBuild (metaUrl: string) {
  generateManifest()

  const { default: manifest } = await import(metaUrl.split('/').slice(0, -1).join('/') + '/pangea.gen.ts')

  await build(manifest)
}

export { runBuild }
