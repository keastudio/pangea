import React from 'react'
import { css, combine } from '$pangea/src/css.js'

type ButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>,
  children: React.ReactNode,
  'aria-label': string | undefined,
  isCircular: boolean | undefined
}

const Button = ({
  onClick,
  isCircular = false,
  'aria-label': ariaLabel,
  children
}: ButtonProps) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={combine(
      css`
        background-color: #4e43cb;
        color: #fff;
        padding: 1rem;
        height: 3.5rem;
        width: 3.5rem;
        transition: background-color 0.2s ease-out;
        &:focus {
          outline: 4px solid #4e43cb99;
          outline-offset: 2px;
        }
        &:hover {
          background-color: #4e43cbcc;
        }
      `,
      [
        isCircular,
        css`
          border-radius: 50%;
        `,
        css`
          border-radius: 0.75rem;
        `
      ]
    )}
  >
    {children}
  </button>
)

export { Button as default }
