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

test('create store', () => {
  const store = createStore(
    (): MessageStore => ({
      messages: [],
      status: Status.OK
    })
  )

  expect(store).toMatchObject({
    state: { messages: [], status: Status.OK },
    reset: expect.any(Function),
    subscribe: expect.any(Function),
    subscribeAll: expect.any(Function)
  })
})
