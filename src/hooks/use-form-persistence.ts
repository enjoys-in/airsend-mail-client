"use client"

import { useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"

export function useFormPersistence<T>(form: UseFormReturn<any>, key: string, shouldPersist = true) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasPersistedData, setHasPersistedData] = useState(false)

  // Load form data from localStorage on initial render
  useEffect(() => {
    if (!shouldPersist) {
      setIsLoading(false)
      return
    }

    try {
      const savedData = localStorage.getItem(key)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        form.reset(parsedData)
        setHasPersistedData(true)
      }
    } catch (error) {
      console.error("Error loading saved form data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [form, key, shouldPersist])

  // Save form data to localStorage when values change
  const saveFormData = () => {
    if (!shouldPersist) return

    try {
      const formValues = form.getValues()
      localStorage.setItem(key, JSON.stringify(formValues))
    } catch (error) {
      console.error("Error saving form data:", error)
    }
  }

  // Clear saved form data
  const clearPersistedData = () => {
    try {
      localStorage.removeItem(key)
      setHasPersistedData(false)
    } catch (error) {
      console.error("Error clearing form data:", error)
    }
  }

  return {
    isLoading,
    hasPersistedData,
    saveFormData,
    clearPersistedData,
  }
}
