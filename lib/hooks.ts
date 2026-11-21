"use client"

import { useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import { api } from "./api"

export function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useBarrios(refreshInterval = 0) {
  return useSWR("barrios", () => api.listBarrios(), { refreshInterval, keepPreviousData: true })
}

export function revalidateLeadsAndBarrios() {
  return Promise.all([
    mutate((key) => Array.isArray(key) && ["leads", "lead-kpi", "celdas"].includes(key[0])),
    mutate("barrios"),
  ])
}
