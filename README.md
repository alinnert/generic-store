# TStore

This is a very simple data store/state management library, writen in TypeScript. It also comes with a React hook.

## Why?

When I started learning React (after making some projects with Vue) I was looking for a data store solution. The two big ones in the React ecosystem are *Redux* and *MobX*. But I think both have flaws in my opinion:

Redux is bulky (in terms of boilerplate code) and the necessary type parameters for the `useSelector<T, U>()` hook are awkward but necessary. Also, there's another library necessary to write async actions.

The API of MobX just feels like its all over the place. This gives me a hard time getting started with it. There are many ways to do the same thing, including decorators which aren't supported by `create-react-app` - for a good reason.

Then I stumbled over one of those "You probably don't need Redux" articles. It made me think. So I created a module that fetches data from a server, stores it (+ some status information) in variables and connected that modules to a React component via a hook. I made another one for a different resource on the same server. Now I was able to identify the repeating parts and abstracted them away into a new module. TStore is the result of that effort. It turned out to be less than 50 LOC which was really surprising.

## What are the benefits?

- It has been written with TypeScript in mind. It's super convenient to type your stores.
- The API surface is tiny, which makes it easy to learn.
- It "supports" async actions out of the box, by not limiting to sync actions in the first place.
- No wrapper component needed.
- Also, React support is separated from the core implementation - but included. So, you can use it with any UI framework.

## Are there drawbacks?

- A store root **must** be an object, no arrays or other non-object types are supported. Its properties can be of any type.
- Currently, there's no support for computed values. (May be added later)
- No time-travel debugging.

## How do I install it?

~~~ bash
$ npm install tstore
~~~

## How do I use it?

First of all you create your store.

**newsStore.ts**

~~~ ts
import { createStore, createReactHook } from './createStore.ts'

// STEP 1: create interfaces that describe your store
interface News {
  title: string
  body: string
}

interface NewsStore {
  items: News[]
  loading: boolean
  error: boolean
}

// STEP 2: create the initial state (this MUST be an object)
const initialState: NewsStore = {
  items: [],
  loading: false,
  error: false
}

// STEP 3: create the store
const newsStore = createStore<NewsStore>(initialState)

// STEP 4A (React): create the React hook and export it
export const useNewsStore = createReactHook(newsStore)

// STEP 4B (No React): subscribe to the store
// You will receive the latest state immediately after subscribing.
const unsubscribeNewsStore = newsStore.subscribe((newState) => {
  doSomethingWith(newState)
})

// Unsubscribe if you're finished with your business.
// Useful for component frameworks like React.
// This is what the built-in React hook actually does.
unsubscribeNewsStore()

// You can also access the current state. This returns the
// store object. In this case it's of type `NewsStore`.
newsStore.state

// STEP 5: write some (maybe async) functions to change your store
export async function loadNews (): Promise<void> {
  newsStore.set({ loading: true, error: false })
  
  try {
    const result = axios.get('/news')
    newsStore.set({ items: result.data, loading: false, error: false })
  } catch {
    // Just to demonstrate the other way to update the store.
    // This function is more flexible since you can
    // read the state and set it based on that information.
    // The callback function can also be async, in case you
    // you need to await something from the inside.
    newsStore.update(state => {
      state.loading = false
      state.error = true
    })
  }
}
~~~

Now you can use this hook and the functions in your components

**NewsList.tsx**

~~~ tsx
import React, { FC } from 'react'
import { useNewsStore, loadNews } from '../stores/newsStore'

export const NewsList: FC = () => {
  // Destructure the top-level props from the store.
  // The fun part is: The types get inferred all the through,
  // starting at the interface "NewsStore".
  // The type of `items` is `News[]`
  // The type of `items[0].title` is `string`.
  const { items, loading, error } = useNewsStore()
  
  useEffect(() => {
    // Fetch news from the server when the component mounts.
    // Just call the function directly. No fancy stuff needed.
    loadNews()
  }, [])
  
  function handleRefreshClick () {
    // If the user clicks the "Refresh" button, load the news again.
    loadNews()
  }

  return (
    <div className="news-list">
      <button onClick={handleRefreshClick}>Refresh</button>
    
      {loading ? <div>Loading...</div> : null}
      {error ? <div>An error occured.</div> : null}
      {items.length === 0 ? <div>There are no news.</div> : null}
      
      {items.map(item => (
        <article>
          <h2>{item.title}</h2>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  )
}
~~~

That's all there is to it!
