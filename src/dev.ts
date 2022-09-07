import { serve as serveHttp } from 'https://deno.land/std@0.152.0/http/server.ts'

import { existsSync } from 'https://deno.land/std@0.152.0/fs/mod.ts'

import { generateIslandFile, generateSharedDependenciesFile, handlePage } from './utils.ts'
import { dirname, basename, fromFileUrl, join } from 'https://deno.land/std@0.150.0/path/mod.ts'

import { lookup } from 'https://deno.land/x/mrmime@v1.0.0/mod.ts'
import { generateManifest } from './generateManifest.ts'

export async function dev (baseModuleUrl: string) {
  const baseDir = dirname(fromFileUrl(baseModuleUrl))
  const projectDir = existsSync(join(baseDir, 'src'))
    ? join(baseDir, 'src')
    : baseDir

  await generateManifest()

  const { default: manifest } = await import(join(baseDir, 'pangea.gen.ts'))

  const islandsDir = join(projectDir, 'islands')

  type responseMapItem = [
    (string | RegExp),
    ({ requestPrefix, requestPath }: { requestPrefix: string, requestPath: string }) => Promise<Response>
  ]
  const responseMap: responseMapItem[] = []

  if (existsSync(islandsDir)) {
    for (const { name, isFile } of Deno.readDirSync(islandsDir)) {
      if (isFile === true) {
        const path = join(islandsDir, name)
  
        responseMap.push([
          '/' + basename(path).split('.')[0] + '.js',
          async () => {
            const responseBody = await generateIslandFile(path)
  
            return new Response(
              responseBody,
              {
                status: 200,
                headers: new Headers({
                  'content-type': 'application/javascript'
                })
              }
            )
          }
        ])
      }
    }
  
    responseMap.push([
      '/shared.js',
      async () => {
        const responseBody = await generateSharedDependenciesFile({ projectDir })
  
        return await Promise.resolve(
          new Response(
            responseBody,
            {
              status: 200,
              headers: new Headers({
                'content-type': 'application/javascript'
              })
            }
          )
        )
      }
    ])
  }
  
  const servePages = async (subPath: string[]) => {
    for (const { name, isFile } of Deno.readDirSync(['./src/pages', ...subPath].join('/'))) {
      if (isFile) {
        const cssRouteRegex = RegExp(`^/${[...subPath, name.split('.')[0]].join('/')}\\.([a-z0-9]{6})\\.css`)
  
        let styleSheetHashCached: string
        let styleSheetBodyCached: string
  
        responseMap.push([
          cssRouteRegex,
          async ({ requestPath }) => {
            const requestId = (requestPath?.match(cssRouteRegex) ?? [])[1]
  
            if (requestId === styleSheetHashCached) {
              return await Promise.resolve(
                new Response(
                  styleSheetBodyCached,
                  {
                    status: 200,
                    headers: new Headers({
                      'content-type': 'text/css'
                    })
                  }
                )
              )
            } else {
              return await Promise.resolve(
                new Response(
                  null,
                  {
                    status: 404
                  }
                )
              )
            }
          }
        ])
  
        const dynamicParameterRegex = /:([a-z]+)/g
  
        if (dynamicParameterRegex.test(name)) {
          const { default: Page, getStaticProps, getStaticPaths } = manifest.pages['./src/pages/' + [...subPath, name].join('/')]

          const paths = (await getStaticPaths())?.paths
          if (name !== 'index' && paths) {
            for (const { params } of paths) {
              const path = '/' + [...subPath, name.split('.')[0]].join('/')
  
              const substitutedPath = path.replace(
                /\/:([a-z]+)/g,
                (_match, capturedGroup1) => params[capturedGroup1] === ''
                  ? ''
                  : '/' + params[capturedGroup1].replaceAll('/', '')
              )
  
              responseMap.push([
                substitutedPath,
                async () => {
                  const { pageBody, styleSheetHash, styleSheetBody } = await handlePage({
                    Page,
                    getStaticProps,
                    path: [...subPath, name].join('/'),
                    params,
                    servestApp: (route, responseHandler) => {
                      responseMap.push([route, responseHandler])
                    }
                  })
  
                  styleSheetHashCached = styleSheetHash
                  styleSheetBodyCached = styleSheetBody
  
                  return new Response(
                    pageBody,
                    {
                      status: 200,
                      headers: new Headers({
                        'content-type': 'text/html'
                      })
                    }
                  )
                }
              ])
  
              responseMap.push([
                substitutedPath + '/',
                ({ requestPrefix }: { requestPrefix: string }) => Response.redirect(requestPrefix + substitutedPath, 302)
              ])
            }
          }
        } else {
          const path = '/' + [...subPath, ...name.split('.')[0] === 'index' ? [] : [name.split('.')[0]]].join('/')
  
          const { default: Page, getStaticProps } = manifest.pages['./src/pages/' + [...subPath, name].join('/')]

          responseMap.push([
            path,
            async () => {
              const { pageBody, styleSheetHash, styleSheetBody } = await handlePage({
                Page,
                getStaticProps,
                path: [...subPath, name].join('/'),
                servestApp: (route, responseHandler) => {
                  responseMap.push([route, responseHandler])
                }
              })
  
              styleSheetHashCached = styleSheetHash
              styleSheetBodyCached = styleSheetBody
  
              return new Response(
                pageBody,
                {
                  status: 200,
                  headers: new Headers({
                    'content-type': 'text/html'
                  })
                }
              )
            }
          ])
  
          if (name !== 'index') {
            responseMap.push([
              path + '/',
              async ({ requestPrefix }) => await Promise.resolve(Response.redirect(requestPrefix + path, 302))
            ])
          }
        }
      } else {
        servePages([...subPath, name])
      }
    }
  }
  
  servePages([])
  
  const handler = async request => {
    const requestPrefix = new URL(request.url).origin
  
    const requestPath = new URL(request.url).pathname
  
    const matchedRule = responseMap.reduce(
      (acc, [route, responseHandler]) => (typeof route === 'object' && route.test(requestPath) === true)
        ? ({
            ruleType: 'regex',
            responseHandler
          })
        : (typeof route === 'string' && requestPath === route)
            ? ({
                ruleType: 'exact',
                responseHandler
              })
            : acc,
      null
    )
  
    if (matchedRule !== null) {
      return await matchedRule.responseHandler({
        requestPath,
        requestPrefix
      })
    }
  
    const mimeType = lookup(requestPath.split('.').slice(-1))
  
    if (mimeType !== undefined && existsSync('./src/static' + requestPath)) {
      const file = await Deno.readFile('./src/static' + requestPath)
      if (file) {
        return new Response(
          file,
          {
            status: 200,
            headers: {
              'content-type': mimeType
            }
          }
        )
      }
    }
  
    return new Response(
      'Page not found',
      {
        status: 404
      }
    )
  }
  
  await serveHttp(handler, { port: 3000 })
}

