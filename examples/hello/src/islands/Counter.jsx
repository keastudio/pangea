import React from 'react'
import { css, combine } from '$pangea/src/css.js'

const Counter = ({ initialCount }) => {
  const [count, setCount] = React.useState(initialCount)

  return (
    <>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <p
        className={combine(
          css`
            margin-top: 3rem;
            font-size: 2rem;
          `,
          [
            count >= 0,
            css`
              color: green;
            `,
            css`
              color: red;
            `
          ]
        )}
      >
        {count}
      </p>
    </>
  )
}

export { Counter as default }
