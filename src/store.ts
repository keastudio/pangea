import React from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Subscription } from 'https://esm.sh/rxjs@7.5.6?pin=v92'

import { Subject } from 'https://esm.sh/rxjs@7.5.6?pin=v92'

interface globalStoreType extends Record<string, unknown> {
  init: () => void,
  subscribe: (reactStateSetter: Dispatch<React.SetStateAction<null>>) => Subscription
}

const useGlobalState = (globalStore: globalStoreType, initialState = null) => {
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

type createStoreArgs = {
  initialState: Record<string, unknown>,
  createActions: ({ setState }: { setState: (state: Record<string, unknown>) => void }) => Record<string, unknown>
}

const createStore = ({ initialState, createActions }: createStoreArgs) => {
  const subject = new Subject()

  const setState = (newState: Record<string, unknown>) => {
    subject.next(newState)
  }

  const store = {
    init: () => subject.next(initialState),
    // deno-lint-ignore no-explicit-any
    subscribe: (reactStateSetter: SetStateAction<any>) => subject.subscribe(reactStateSetter),
    ...createActions({ setState })
  }

  return store
}

export { useGlobalState, createStore }
