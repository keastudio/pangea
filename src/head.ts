import { Fragment, createElement } from 'react'
import type { ReactNode } from 'react'
import ReactDOMServer from 'react-dom/server'

import { memoryStorage } from './utils/memoryStorage.ts'

function Head ({ children }: { children: (ReactNode | ReactNode[]) }) {
  const headNodes = memoryStorage.getItem('headNodes') || ''

  memoryStorage.setItem(
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
