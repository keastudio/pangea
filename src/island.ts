/// <reference path='./dev.ts' />
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { createHash } from 'https://deno.land/std@0.152.0/hash/mod.ts'
import { existsSync } from 'https://deno.land/std@0.152.0/fs/mod.ts'

// deno-lint-ignore no-explicit-any
function Island ({ path, app, data }: { path: string, app: (React.FunctionComponent<any> | React.ComponentClass<any, any>), data: Record<string, unknown> }) {
  const devServerHandler = window.devServerHandler

  if ('globalStore' in data) {
    throw new Error(`The data prop for the Island component contained the property "globalStore" (for path "${path}"). This should not be included, becuase the framework handles passing this to the frontend.`)
  }

  const islandFilename = path.split('/').slice(-1)[0].split('.')[0] + '_' + createHash('md5').update(JSON.stringify(data)) + '.js'
  const hydrateIslandFilename = 'hydrate-' + islandFilename

  const scriptBody = `
    import { React, ReactDOMClient, ${existsSync('./src/store.ts') ? 'globalStore' : ''} } from './shared.js'
    import App from './${path.split('/').slice(-1)[0].split('.')[0] + '.js'}'

    ReactDOMClient.hydrateRoot(
      document.querySelector('#${islandFilename.split('.')[0]}'),
      React.createElement(
        App,
        { ...JSON.parse(\`${JSON.stringify(data)}\`), ${existsSync('./src/store.ts') ? 'globalStore' : ''} }
      )
    )
  `

  if (devServerHandler) {
    devServerHandler(
      '/' + hydrateIslandFilename,
      async () => {
        return await Promise.resolve(
          new Response(
            scriptBody,
            {
              status: 200,
              headers: new Headers({
                'content-type': 'application/javascript; charset=UTF-8'
              })
            }
          )
        )
      }
    )
  } else {
    Deno.writeTextFileSync(
      'dist/' + hydrateIslandFilename,
      scriptBody
    )
  }

  const existingHydrationScripts = sessionStorage.getItem('hydrationScripts') || ''

  sessionStorage.setItem(
    'hydrationScripts',
    existingHydrationScripts + '<script type="module" src="/' + hydrateIslandFilename + '"></script>'
  )

  return React.createElement(
    'div',
    {
      // TODO: Need to use a ref instead of the filename, as the same island could be used twice on a page
      id: islandFilename.split('.')[0],
      dangerouslySetInnerHTML: {
        __html: ReactDOMServer.renderToString(
          React.createElement(
            app,
            data
          )
        )
      }
    }
  )
}

export { Island }
