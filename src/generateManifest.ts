import { join } from 'https://deno.land/std@0.150.0/path/mod.ts'

async function generateManifest ({ baseModuleUrl, projectDir, projectDirRelative }: { baseModuleUrl: string, projectDir: string, projectDirRelative: string }) {
  const paths: string[] = []

  const generateManifest = (subPath: string[]) => {
    for (const { name, isFile } of Deno.readDirSync(join(projectDir, 'pages', ...subPath))) {
      if (isFile) {
        paths.push('./' + join(projectDirRelative, 'pages', ...subPath, name))
      } else {
        generateManifest([...subPath, name])
      }
    }
  }
  
  generateManifest([])

  const manifestPath = baseModuleUrl.split('/').slice(0, -1).join('/') + '/pangea.gen.ts'

  Deno.writeTextFileSync(
    manifestPath.replace('file://', ''),
    `
      ${paths.map((path, index) => `import * as \$${index} from '${path}'`).join('\n')}

      const manifest = {
        pages: {
          ${paths.map((path, index) => `'${path}': $${index}`)}
        }
      }

      export { manifest as default }
    `
  )

  const { default: manifest } = await import(manifestPath)

  return manifest
}

export { generateManifest }
