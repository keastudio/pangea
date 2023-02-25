import { Fragment, createElement } from 'react'
import type { ReactNode } from 'react'
import ReactDOMServer from 'react-dom/server'

import { typedStorage } from './utils.ts'

function Head ({ children }: { children: (ReactNode | ReactNode[]) }) {
  const headNodes = typedStorage.getItem('headNodes') || ''

  typedStorage.setItem(
    'headNodes',
    headNodes + ReactDOMServer.renderToStaticMarkup(
      createElement(
        Fragment,
        {},
        children
      )
    )
  )

  return null
}

export { Head }
