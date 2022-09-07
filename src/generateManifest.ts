async function generateManifest () {
  const paths = []

  const generateManifest = subPath => {
    for (const { name, isFile } of Deno.readDirSync(['./src/pages', ...subPath].join('/'))) {
      if (isFile) {
        paths.push('./src/pages/' + [...subPath, name].join('/'))
      } else {
        generateManifest([...subPath, name])
      }
    }
  }
  
  generateManifest([])

  await Deno.writeTextFile(
    `./pangea.gen.ts`,
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
}

export { generateManifest }
