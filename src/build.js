import { stop, transform } from 'https://deno.land/x/esbuild@v0.14.54/mod.js'
import { emptyDirSync, walk, existsSync } from 'https://deno.land/std@0.152.0/fs/mod.ts'

import { generateIslandFile, generateSharedDependenciesFile, handlePage } from './utils.jsx'

export async function build (manifest) {
  // Clear out the dist directory before building
  emptyDirSync('./dist')

  if (existsSync('./src/islands')) {
    for await (const { name, isFile } of Deno.readDir('./src/islands')) {
      const path = './src/islands/' + name
      if (isFile === true) {
        Deno.writeTextFile(
          './dist/' + name.split('.')[0] + '.js',
          await generateIslandFile(path)
        )
      }
    }

    Deno.writeTextFile(
      'dist/shared.js',
      await generateSharedDependenciesFile()
    )
  }

  // Copy files in static to dist if they exist
  if (existsSync('./src/static')) {
    for await (const { name, path, isDirectory } of walk('./src/static')) {
      const destinationPath = path.replace('src/static', './dist/')

      if (path === 'src/static') {
        // pass
      } else if (isDirectory) {
        await Deno.mkdir(destinationPath)
      } else if (/\.css$/.test(name)) {
        const css = await Deno.readTextFile(path)

        const minifiedCss = await transform(css, { loader: 'css', minify: true })
          .then(({ code }) => code)

        Deno.writeTextFile(destinationPath, minifiedCss)
      } else {
        Deno.copyFile(path, destinationPath)
      }
    }
  }

  const outputPages = async subPath => {
    for (const { name, isFile } of Deno.readDirSync(['./src/pages', ...subPath].join('/'))) {
      if (isFile) {
        const dynamicParameterRegex = /:([a-z]+)/g

        if (dynamicParameterRegex.test(name)) {
          const { default: Page, getStaticProps, getStaticPaths } = manifest.pages['./src/pages/' + [...subPath, name].join('/')]

          const paths = (await getStaticPaths())?.paths
          if (name !== 'index' && paths) {
            for (const { params } of paths) {
              const path = ['./dist', ...subPath, name.split('.')[0]].join('/')

              const substitutedPath = path.replace(
                dynamicParameterRegex,
                (_match, capturedGroup1) => params[capturedGroup1] === ''
                  ? 'index'
                  : params[capturedGroup1].replaceAll('/', '')
              )

              const { pageBody, styleSheetHash, styleSheetBody } = await handlePage({
                Page,
                getStaticProps,
                path: [...subPath, name].join('/'),
                params
              })

              if (styleSheetHash) {
                Deno.writeTextFileSync(
                  `${path}.${styleSheetHash}.css`,
                  styleSheetBody
                )
              }

              Deno.writeTextFileSync(
                `${substitutedPath}.html`,
                pageBody
              )
            }
          }
        } else {
          const { default: Page, getStaticProps } = manifest.pages['./src/pages/' + [...subPath, name].join('/')]

          const { styleSheetHash, styleSheetBody, pageBody } = await handlePage({ Page, getStaticProps, path: [...subPath, name].join('/') })

          if (styleSheetHash) {
            Deno.writeTextFileSync(
              `${['./dist', ...subPath, name.split('.')[0]].join('/')}.${styleSheetHash}.css`,
              styleSheetBody
            )
          }

          Deno.writeTextFileSync(
            `${['./dist', ...subPath, name.split('.')[0]].join('/')}.html`,
            pageBody
          )
        }
      } else {
        Deno.mkdirSync(['./dist', ...subPath, name].join('/'))
        await outputPages([...subPath, name])
      }
    }
  }

  await outputPages([])

  stop()
}
