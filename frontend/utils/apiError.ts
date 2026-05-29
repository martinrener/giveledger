const apiError = (e: unknown, fallback: string): string => {
  const data = (e as { data?: { error?: string } })?.data
  return data?.error ?? (e instanceof Error ? e.message : fallback)
}

export default apiError
