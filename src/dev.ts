import { serve as serveHttp } from 'https://deno.land/std@0.152.0/http/server.ts'
import { existsSync } from 'https://deno.land/std@0.152.0/fs/mod.ts'
import { dirname, basename, fromFileUrl, join } from 'https://deno.land/std@0.150.0/path/mod.ts'
import { lookup } from 'https://deno.land/x/mrmime@v1.0.0/mod.ts'

import { generateIslandFile } from './utils/generateIslandFile.ts'
import { generateSharedDependenciesFile } from './utils/generateSharedDependenciesFile.ts'
import { handlePage } from './utils/handlePage.ts'

export type routeType = (string | RegExp)
export type responseHandlerType = ({ requestPrefix, requestPath, request }: { requestPrefix: string, requestPath: string, request: Request }) => Promise<Response>

type responseMapItem = [
  routeType,
  responseHandlerType
]

declare global {
  let devServerHandler: (route: routeType, responseHandler: responseHandlerType) => void
  interface Window {
    devServerHandler: (route: routeType, responseHandler: responseHandlerType) => void 
  }
}

export async function dev (baseModuleUrl: string) {
  const baseDir = dirname(fromFileUrl(baseModuleUrl))
  const projectDirRelative = existsSync(join(baseDir, 'src'))
    ? 'src'
    : ''
  const projectDir = join(baseDir, projectDirRelative)

  const islandsDir = join(projectDir, 'islands')

  const buildId = crypto.randomUUID()
  const reloadScriptSrc = '/reload.js'
  const reloadWebSocketUrl = '/alive'

  window.devServerHandler = (route: routeType, responseHandler: responseHandlerType) => {
    responseMap.push([route, responseHandler])
  }

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
                  'content-type': 'application/javascript; charset=UTF-8'
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
                'content-type': 'application/javascript; charset=UTF-8'
              })
            }
          )
        )
      }
    ])
  }

  const servePages = async (subPath: string[]) => {
    for (const { name, isFile } of Deno.readDirSync(join(projectDir, 'pages', ...subPath))) {
      if (isFile) {
        const cssRouteRegex = RegExp(`^/${encodeURI([...subPath, name.split('.')[0]].join('/'))}\\.([a-z0-9]{6})\\.css$`)
  
        let styleSheetHashCached: (string | null)
        let styleSheetBodyCached: (string | null)
  
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
  
        const dynamicParameterRegex = /\[([a-z]+)\]/g
  
        if (dynamicParameterRegex.test(name)) {
          const { default: Page, getStaticProps, getStaticPaths } = await import('file://' + join(projectDir, 'pages', ...subPath, name))

          const paths = (await getStaticPaths())?.paths
          if (name !== 'index' && paths) {
            for (const { params } of paths) {
              const path = '/' + [...subPath, name.split('.')[0]].join('/')
  
              const substitutedPath = path.replace(
                /\/\[([a-z]+)\]/g,
                (_match, capturedGroup1) => params[capturedGroup1] === ''
                  ? '/'
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
                    reloadScriptSrc
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
            }
          }
        } else {
          const path = '/' + [...subPath, ...name.split('.')[0] === 'index' ? [] : [name.split('.')[0]]].join('/')
  
          const { default: Page, getStaticProps } = await import('file://' + join(projectDir, 'pages', ...subPath, name))

          responseMap.push([
            path,
            async () => {
              const { pageBody, styleSheetHash, styleSheetBody } = await handlePage({
                Page,
                getStaticProps,
                path: [...subPath, name].join('/'),
                reloadScriptSrc
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
        }
      } else {
        servePages([...subPath, name])
      }
    }
  }
  
  await servePages([])
  
  responseMap.push([
    reloadWebSocketUrl,
    async ({ request }) => {
      const { socket: ws, response } = Deno.upgradeWebSocket(request)
      ws.onopen = () => {
        ws.send(buildId)
      }
      
      return await Promise.resolve(response)
    }
  ])

  responseMap.push([
    reloadScriptSrc,
    async () => {
      return await Promise.resolve(
        new Response(
          `
            let reconnectionAttempts = 0
          
            function startWebsocket () {
              const connection = new WebSocket('ws://' + window.location.host + '${reloadWebSocketUrl}')
              
              connection.onmessage = event => {
                if (event.data !== '${buildId}') {
                  connection.onclose = () => {}
                  connection.close()
                  location.reload()
                }
              }

              connection.onclose = () => {
                if (reconnectionAttempts < 10) {
                  reconnectionAttempts++
                  setTimeout(
                    startWebsocket,
                    500
                  )
                }
              }
            }

            startWebsocket()
          `,
          {
            status: 200,
            headers: {
              'content-type': 'application/javascript; charset=UTF-8'
            }
          }
  
        )
      )
    }
  ])

  const handler = async (request: Request) => {
    const requestPrefix = new URL(request.url).origin
  
    const requestPath = new URL(request.url).pathname

    const matchedRule = responseMap.find(
      ([route]) => typeof route === 'string'
        ? RegExp('^' + route.replace(/\/$/, '') + '\/?$').test(requestPath)
        : route.test(requestPath) === true
    )

    if (matchedRule && typeof matchedRule[0] === 'string' && requestPath !== matchedRule[0]) {
      return await Promise.resolve(Response.redirect(requestPrefix + matchedRule[0], 302))
    }
  
    if (matchedRule) {
      const responseHandler = matchedRule[1]
      return await responseHandler({
        requestPath,
        requestPrefix,
        request
      })
    }
  
    const staticDir = join(baseDir, 'static')

    const mimeType = lookup(requestPath.split('.').slice(-1)[0])
  
    if (mimeType !== undefined && existsSync(join(staticDir, requestPath))) {
      const file = await Deno.readFile(join(staticDir, requestPath))
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

