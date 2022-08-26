import React from 'react'

const Counter = ({ initialCount }) => {
  const [count, setCount] = React.useState(initialCount)

  return (
    <>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(count + 1)}>+1</button>
      {count}
    </>
  )
}

export { Counter as default }
