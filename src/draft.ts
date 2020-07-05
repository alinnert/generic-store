import { createReactHook, createStore } from './index'

interface Message {
  sender: string
  read: boolean
  text: string
}

enum Status { ok, loading, error }

interface MessageState {
  messages: Message[]
  status: Status
}

const store = createStore(
  (): MessageState => ({
    messages: [],
    status: Status.ok
  }),
  {
    computed: {
      messagesCount: state => state.messages.length,
      unreadMessagesCount: state => state.messages.filter(it => !it.read).length,
      allRead: state => state.messages.every(it => it.read)
    }
  }
)

store.subscribe('allRead', state => {
  if (!state.allRead) {
    console.log('new unread messages arrived!')
  }
})

export const useMessagesStore = createReactHook(store)
