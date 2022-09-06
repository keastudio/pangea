import React from 'react'

const useRxjsState = (globalStore, initialState = null) => {
  const [state, stateSetterForRxjs] = React.useState(initialState)

  React.useEffect(
    () => {
      globalStore.subscribe(stateSetterForRxjs)
      globalStore.init()
    },
    []
  )

  return state
}

export { useRxjsState }
