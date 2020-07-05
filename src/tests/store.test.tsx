import { createStore } from '..'

interface Message {
  sender: string
  read: boolean
}

enum Status { OK, PENDING, ERROR }

interface MessageStore {
  messages: Message[]
  status: Status
}

const init = (): MessageStore => ({ messages: [], status: Status.OK })
const dummyMessage = { sender: 'John', read: false }

test('create store', () => {
  const store = createStore(init)

  expect(store).toMatchObject({
    state: { messages: [], status: Status.OK },
    set: expect.any(Function),
    reset: expect.any(Function),
    subscribe: expect.any(Function),
    subscribeAll: expect.any(Function)
  })
})

test('change values', () => {
  const store = createStore(init)

  store.set({ status: Status.PENDING })

  expect(store.state).toEqual({ messages: [], status: Status.PENDING })

  store.set({ messages: [dummyMessage], status: Status.OK })

  expect(store.state).toEqual({
    messages: [dummyMessage],
    status: Status.OK
  })
})

test('computed values', () => {
  const store = createStore(init, {
    computed: {
      messagesCount: state => state.messages.length
    }
  })

  expect(store.state.messagesCount).toBe(0)

  store.set({ messages: [dummyMessage] })

  expect(store.state.messagesCount).toBe(1)
})
