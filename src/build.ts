import { stop, transform } from 'https://deno.land/x/esbuild@v0.14.51/mod.js'
import { emptyDir, walk, existsSync } from 'https://deno.land/std@0.152.0/fs/mod.ts'
import { dirname, fromFileUrl, join } from 'https://deno.land/std@0.150.0/path/mod.ts'

import { generateIslandFile, generateSharedDependenciesFile, handlePage } from './utils.ts'
import { generateManifest } from './generateManifest.ts'

export async function build (baseModuleUrl: string) {
  const baseDir = dirname(fromFileUrl(baseModuleUrl))
  const projectDirRelative = existsSync(join(baseDir, 'src'))
    ? 'src'
    : ''
  const projectDir = join(baseDir, projectDirRelative)

  const manifest = await generateManifest({ baseDir, projectDir, projectDirRelative })

  // Clear out the dist directory before building
  await emptyDir(join(baseDir, 'dist'))

  const islandsDir = join(projectDir, 'islands')

  if (existsSync(islandsDir)) {
    for await (const { name, isFile } of Deno.readDir(islandsDir)) {
      const path = join(projectDir, 'islands', name)
      if (isFile === true) {
        Deno.writeTextFile(
          join(baseDir, 'dist/', name.split('.')[0] + '.js'),
          await generateIslandFile(path)
        )
      }
    }

    Deno.writeTextFile(
      'dist/shared.js',
      await generateSharedDependenciesFile({ projectDir })
    )
  }

  const staticDir = join(baseDir, 'static')

  // Copy files in static to dist if they exist
  if (existsSync(staticDir)) {
    for await (const { name, path, isDirectory } of walk(staticDir)) {
      const destinationPath = path.replace(staticDir, join(baseDir, 'dist'))

      if (path === staticDir) {
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

  const outputPages = async (subPath: string[]) => {
    for (const { name, isFile } of Deno.readDirSync(join(projectDir, 'pages', ...subPath))) {
      if (isFile) {
        const dynamicParameterRegex = /:([a-z]+)/g

        if (dynamicParameterRegex.test(name)) {
          const { default: Page, getStaticProps, getStaticPaths } = manifest.pages['./' + join(projectDirRelative, 'pages', ...subPath, name)]

          const paths = (await getStaticPaths())?.paths
          if (name !== 'index' && paths) {
            for (const { params } of paths) {
              const path = join(baseDir, 'dist', ...subPath, name.split('.')[0])

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

              if (styleSheetHash && styleSheetBody) {
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
          console.log(join(projectDirRelative, 'pages', ...subPath, name))
          const { default: Page, getStaticProps } = manifest.pages['./' + join(projectDirRelative, 'pages', ...subPath, name)]

          const { styleSheetHash, styleSheetBody, pageBody } = await handlePage({ Page, getStaticProps, path: [...subPath, name].join('/') })

          if (styleSheetHash && styleSheetBody) {
            Deno.writeTextFileSync(
              `${join(baseDir, 'dist', ...subPath, name.split('.')[0])}.${styleSheetHash}.css`,
              styleSheetBody
            )
          }

          Deno.writeTextFileSync(
            `${join(baseDir, 'dist', ...subPath, name.split('.')[0])}.html`,
            pageBody
          )
        }
      } else {
        Deno.mkdirSync(join(baseDir, 'dist', ...subPath, name))
        await outputPages([...subPath, name])
      }
    }
  }

  await outputPages([])

  stop()
}
