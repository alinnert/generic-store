import { useEffect, useState } from 'react'

type Subscriber<T> = (store: T) => void

interface Store<T> {
  state: T
  set(state: Partial<T>): void
  subscribe(callback: Subscriber<T>): (() => void) | void
}

export function createStore<T> (initialState: T): Store<T> {
  const subscriptions: Array<Subscriber<T>> = []
  const state: T = initialState
  const notify = (): void => { for (const sub of subscriptions) { sub(state) } }

  return {
    state,

    set (changes) {
      Object.assign(state, changes)
      notify()
    },

    subscribe (callback) {
      if (subscriptions.includes(callback)) { return }
      subscriptions.push(callback)
      callback(state)
      return () => { subscriptions.splice(subscriptions.indexOf(callback), 1) }
    }
  }
}

export function createReactHook<T> (store: Store<T>): () => T {
  return function useStore (): T {
    const [state, setState] = useState<T>(store.state)
    const handleChange: Subscriber<T> = changes => { setState({ ...changes }) }
    useEffect(() => store.subscribe(handleChange), [])
    return state
  }
}
