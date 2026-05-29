interface SseEvent {
  type: string
  data: unknown
}

interface SseOptions {
  onConnect?: () => void
}

const useSse = (
  getUrl: () => string,
  onEvent: (type: string, data: unknown) => void,
  options: SseOptions = {},
) => {
  const connected = ref(false)
  let source: EventSource | null = null

  const connect = () => {
    if (!import.meta.client) { return }

    source = new EventSource(getUrl())

    source.onopen = () => {
      connected.value = true
      options.onConnect?.()
    }

    source.onmessage = (e: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(e.data) as SseEvent
        onEvent(parsed.type, parsed.data)
      } catch {
        // ignore malformed messages
      }
    }

    source.onerror = () => { connected.value = false }
  }

  const disconnect = () => {
    source?.close()
    source = null
    connected.value = false
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return { connected }
}

export default useSse
