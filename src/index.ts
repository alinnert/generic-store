import { useEffect, useState } from 'react'

// #region types
type Subscriber<T> = (store: T) => void
type ComputedFn<T> = (state: T) => unknown
type ComputedConfig<T> = Record<string, ComputedFn<T>>
type ComputedValues<T, C extends ComputedConfig<T>> = {
  [CK in keyof C]: ReturnType<C[CK]>
}
type MergedState<T, C extends ComputedConfig<T>> = T & ComputedValues<T, C>
type Subscriptions<T, C extends ComputedConfig<T>> =
  Array<Subscriber<MergedState<T, C>>>
type NamedSubscriptions<T, C extends ComputedConfig<T>> =
  Record<keyof MergedState<T, C>, Array<Subscriber<MergedState<T, C>>>>

interface Store<T, C extends ComputedConfig<T>> {
  state: MergedState<T, C>
  reset: () => void
  set: (state: Partial<T>) => void
  subscribe: (
    name: keyof MergedState<T, C>,
    callback: Subscriber<MergedState<T, C>>
  ) => (() => void) | undefined
  subscribeAll: (
    callback: Subscriber<MergedState<T, C>>
  ) => (() => void) | undefined
}
// #endregion types

const stores: Array<Store<unknown, ComputedConfig<unknown>>> = []

/**
 * Create a new store.
 * @param init
 * A function that initializes the store.
 * @param options
 * A set of options for the created store.
 */
export function createStore<T, C extends ComputedConfig<T>> (
  init: () => T,
  options?: { computed?: C }
): Store<T, C> {
  const computed: C = options?.computed ?? Object.create(null)
  const computedFns = Object.entries(computed ?? {})
  const subscriptions: Subscriptions<T, C> = []
  const namedSubscriptions: NamedSubscriptions<T, C> = Object.create(null)

  /** The state of Type `T`, i.e. without the computed values. */
  let dataState: T = init()

  function generateMergedState (): MergedState<T, C> {
    const computedValuesArray = computedFns.map(([key, value]) => {
      return [key, value(dataState)]
    })
    const computedValues = Object.fromEntries(computedValuesArray)
    return { ...dataState, ...computedValues }
  }

  function updateMergedState (): void {
    store.state = generateMergedState()
  }

  function notifySubscribers (): void {
    for (const subscription of subscriptions) {
      subscription(store.state)
    }
  }

  function notifyNamedSubscribers (name: keyof MergedState<T, C>): void {
    if (namedSubscriptions[name] === undefined) { return }
    for (const subscription of namedSubscriptions[name]) {
      subscription(store.state)
    }
  }

  const store: Store<T, C> = {
    state: generateMergedState(),

    reset () { dataState = init() },

    set (changes) {
      dataState = { ...dataState, ...changes }
      updateMergedState()
      notifySubscribers()
      for (const name of Object.keys(changes)) {
        notifyNamedSubscribers(name)
      }
    },

    subscribe (name, callback) {
      if (!Array.isArray(namedSubscriptions[name])) {
        namedSubscriptions[name] = []
      }
      const targetSubscriptions = namedSubscriptions[name]
      if (targetSubscriptions.includes(callback)) { return }
      targetSubscriptions.push(callback)
      return () => {
        targetSubscriptions
          .splice(targetSubscriptions.indexOf(callback), 1)
      }
    },

    subscribeAll (callback) {
      if (subscriptions.includes(callback)) { return }
      subscriptions.push(callback)
      callback(store.state)
      return () => { subscriptions.splice(subscriptions.indexOf(callback), 1) }
    }
  }

  stores.push(store)

  return store
}

export function resetAllStores (): void {
  for (const store of stores) {
    store.reset()
  }
}

export function createReactHook<T, C extends ComputedConfig<T>> (
  store: Store<T, C>
): () => MergedState<T, C> {
  return function useStore (): MergedState<T, C> {
    const [state, setState] = useState<MergedState<T, C>>(store.state)
    const handleChange: Subscriber<MergedState<T, C>> = changes => { setState({ ...changes }) }
    useEffect(() => store.subscribeAll(handleChange), [])
    return state
  }
}
