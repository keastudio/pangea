import React from 'react'
import type { Dispatch } from 'react'
import type { Subscription } from 'https://esm.sh/rxjs@7.5.6?pin=v92'

interface globalStoreType extends Record<string, unknown> {
  init: () => void;
  subscribe: (reactStateSetter: Dispatch<React.SetStateAction<null>>) => Subscription
}

const useRxjsState = (globalStore: globalStoreType, initialState = null) => {
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
