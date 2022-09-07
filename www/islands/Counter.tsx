import React from 'react'
import { css, combine } from '$pangea/src/css.ts'

import Button from '../components/Button.tsx'

const Counter = ({ initialCount }: { initialCount: number }) => {
  const [count, setCount] = React.useState(initialCount)

  return (
    <div
      className={css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #eee;
        padding: 1rem 2rem;
        border-radius: 0.25rem;
      `}
    >
      <Button
        onClick={() => setCount(count - 1)}
        isCircular
        aria-label='-1'
      >
        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
          <path strokeLinecap='round' d='M5 12h14' />
        </svg>
      </Button>

      <p
        className={combine(
          css`
            font-size: 4rem;
            font-family: 'Fredoka One', cursive;
          `,
          [
            count >= 1,
            css`
              color: green;
            `,
            css`
              color: #777;
            `
          ]
        )}
      >
        {count}
      </p>

      <Button
        onClick={() => setCount(count + 1)}
        isCircular
        aria-label='+1'
      >
        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
          <path strokeLinecap='round' strokeLinejoin='round' d='M12 5v14m7-7H5' />
        </svg>
      </Button>
    </div>
  )
}

export { Counter as default }
