const useApi = () => {
  const auth = useAuthStore()

  return $fetch.create({
    onResponseError({ response }) {
      if (response.status !== 401) { return }
      auth.clearSession()
      navigateTo(`/admin`)
    },
  })
}

export default useApi
