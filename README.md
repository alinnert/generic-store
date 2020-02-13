# Generic Store

This is a very simple, generic data store, writen in TypeScript.

## Why?

When I started learning React (after making some projects with Vue) I was looking for a data store solution. The two big ones in the React ecosystem are *Redux* and *MobX*. But I think both have flaws in my opinion:

Redux is bulky (in terms of boilerplate code) and the necessary type parameters for the `useSelector<T, U>()` hook are awkward but necessary. Also, there's another library necessary to write async actions.

The API of MobX just feels like its all over the place. This gives me a hard time getting started with it. There are many ways to do the same thing, including decorators which aren't supported by `create-react-app` - for a good reason.

Then I stumbled over one of those "You probably don't need Redux" articles. It made me think. So I created a module that fetches data from a server, stores it (+ some status information) in variables and connected that modules to a React component via a hook. I made another one for a different resource on the same server. Now I was able to identify the repeating parts and abstracted them away into a new module. This generic store is the result of that effort. It turned out to be less than 50 LOC which was really surprising.

## What are the benefits?

- It has been written with TypeScript in mind. It's super convenient to type your stores.
- The API surface is tiny, which makes it easy to learn.
- It "supports" async actions out of the box, by not limiting to sync actions in the first place.
- No wrapper component needed.
- Also, React support is separated from the core implementation - but included. So, you can use it with any UI framework.

## Are there drawbacks?

- A store root **must** be an object, no arrays or other non-object types are supported. Its properties can be of any type.
- Making atomic updates in the `.update()` method may take some effort, if they are complex.
- No time-travel debugging.

## How do I install it?

I'm not sure if it's worth putting ~50 LOC on npm. Just put [createStore.ts](https://github.com/alinnert/generic-store/blob/master/createStore.ts) into your project and use it from there. Maybe I'll add it later and also provide a JS version. Also, `generic-store` is just a description, not a name.

## How do I use it?

First of all you create your store. Similar to how you create your Redux reducers.

**newsStore.ts**

~~~ ts
import { createStore, createReactHook } from './createStore.ts'

// step 1: type your store
interface News {
  title: string
  body: string
}

interface NewsStore {
  items: News[]
  loading: boolean
  error: boolean
}

// step 2: create the initial state (this MUST be an object)
const initialState: NewsStore = {
  items: [],
  loading: false,
  error: false
}

// step 3: create the store
const newsStore = createStore<NewsStore>(initialState)

// step 4: create the React hook and export it
export const useNewsStore = createReactHook(newsStore)

// step 5: write some (possibly async) functions to change your store
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
