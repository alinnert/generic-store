# TState

TState is a simple, framework-agnostic state management library written in TypeScript. It also comes with a wrapper function that turns stores into React hooks.

- [Why?](#why-)
- [Features](#features)
- [Drawbacks](#drawbacks)
- [Install](#install)
- [Getting Started](#getting-started)
  - [Create stores](#create-stores)
  - [Use stores](#use-stores)
  - [Update stores](#update-stores)
  - [Reset stores](#reset-stores)
  - [React to store changes](#react-to-store-changes)

## Why?

There are mainly two big state management libraries for React: [_Redux_](https://github.com/reduxjs/redux) and [_MobX_](https://github.com/mobxjs/mobx). But they are either very complex or difficult to use with TypeScript. There's also [_Unstaded_](https://github.com/jamiebuilds/unstated) which is quite similar to TState but is slightly different to use.

I've created TState with these goals in mind:

- As easy to use as possible
- Make use of TypeScript's type inference as much as possible
- Still make it quite feature-rich so it can be used without additional libraries

## Features

- Basic store functionality: create, read and update the state
- Computed values that get updated automatically
- Reset one store or all stores to their default values
- Subscribe to all changes within a store or filter changes by value

## Drawbacks

- A store **must** be a plain object. Arrays and other types result in undefined behavior. The object's properties can by of any type though.

## Install

```bash
$ npm install @alinnert/tstate
```

## Getting started

_This handles the usage of version 2 which hasn't been released yet. It's coming soon._

### Create stores

First, create the types and interfaces for your store:

```ts
export enum Status {
  ok,
  loading,
  error
}

interface News {
  title: string
  body: string
}

interface NewsStore {
  items: News[]
  status: Status
}
```

Create the store by defining its default values and (optionally) computed values:

```ts
import { createStore } from '@alinnert/tstate'

// ...

const store = createStore(
  (): NewsStore => ({
    items: [],
    status: Status.ok
  }),
  {
    computed: {
      itemsCount: state => state.items.length
    }
  }
)
```

If you're using TState with react create your hook:

```ts
import { createStore, createReactHook } from '@alinnert/tstate'

// ...

const store = createStore(/* ... */)

export const useNewsStore = createReactHook(store)
```

_Make sure the hook's name starts with `use` so your linter knows it's a React hook_

### Use stores

Now you can use your store in your components:

```tsx
import { useNewsStore, Status } from './newsStore.ts'

export function NewsList() {
  const { items, status, itemsCount } = useNewsStore()

  return (
    <div>
      <p>There are {itemsCount} articles.</p>

      {status === Status.loading ? (
        <div>Articles are being loaded...</div>
      ) : null}

      {items.map(item => (
        <article>
          <header>
            <h2>{item.title}</h2>
            <div>{item.body}</div>
          </header>
        </article>
      ))}
    </div>
  )
}
```

### Update stores

To update a store's state you can use the `.set()` method. I recommend to export functions from your store that handles all the updating:

```ts
const store = createStore(/* ... */)

export async function loadArticles() {
  store.set({ status: Status.loading })

  try {
    const result = await fetch(/* ... */)
    const items = await result.json()
    store.set({ status: Status.ok, items })
  } catch (error) {
    store.set({ status: Status.error })
  }
}
```

### Reset stores

To reset a store you can call the `.reset()` function. It will set all values to the ones you defined in the initialization function that you passed to `createStore()`:

```ts
store.reset()
```

To reset all available stores there's a `resetAll()` function:

```ts
import { resetAll } from '@alinnert/tstate'

resetAll()
```

### React to store changes

To react to changes in your store you can call `.subscribe(name)` or `.subscribeAll()` on your store.

`.subscribe(name)` reacts to changes of a specific value. You can react to normal and computed values:

```ts
store.subscribe('items', state => {
  console.log(
    `New articles arrived. Now there are ${state.itemsCount} articles.`
  )
})
```

`.subscribeAll()` reacts to any change in a store. `createReactHook()` uses this one internally:

```ts
store.subscribeAll(state => {
  console.log('Something happend in the store.')
})
```
