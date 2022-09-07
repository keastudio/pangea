import { Fragment, createElement } from 'react'
import type { ReactNode } from 'react'
import ReactDOMServer from 'react-dom/server'

function Head ({ children }: { children: (ReactNode | ReactNode[]) }) {
  const headNodes = sessionStorage.getItem('headNodes') || ''

  sessionStorage.setItem(
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
