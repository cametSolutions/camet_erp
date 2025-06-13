import { useEffect, useState } from "react"
import { fetchDataFromApi } from "../api/fetchDataFromApi.js"

const useFetch = (url, params) => {
  const [refresh, setRefresh] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) {
      return
    }
    setLoading(true)
    setData(null)
    setError(null)

    fetchDataFromApi(url, params)
      .then((res) => {
        setLoading(false)
        setData(res)
      })
      // eslint-disable-next-line no-unused-vars
      .catch((err) => {
        setLoading(false)
        setError("Something went wrong!")
      })
  }, [url, refresh])

  const refreshHook = () => {
    setRefresh(!refresh)
  }

  return { data, loading, error, refreshHook }
}

export default useFetch
