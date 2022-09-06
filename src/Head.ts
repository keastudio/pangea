import ReactDOMServer from 'react-dom/server'

function Head ({ children }) {
  const headNodes = sessionStorage.getItem('headNodes') || ''

  sessionStorage.setItem(
    'headNodes',
    headNodes + ReactDOMServer.renderToStaticMarkup(children)
  )

  return null
}

export { Head }
