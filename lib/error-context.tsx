"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { ValidationError, CalculationError } from '@/types'

interface ErrorContextType {
  errors: Record<string, string>
  validationErrors: ValidationError[]
  calculationErrors: CalculationError[]
  addError: (key: string, message: string) => void
  removeError: (key: string) => void
  addValidationError: (error: ValidationError) => void
  addCalculationError: (error: CalculationError) => void
  clearErrors: () => void
  clearValidationErrors: () => void
  clearCalculationErrors: () => void
  hasErrors: () => boolean
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export const useError = () => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

interface ErrorProviderProps {
  children: React.ReactNode
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [calculationErrors, setCalculationErrors] = useState<CalculationError[]>([])

  const addError = useCallback((key: string, message: string) => {
    setErrors(prev => ({ ...prev, [key]: message }))
  }, [])

  const removeError = useCallback((key: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[key]
      return newErrors
    })
  }, [])

  const addValidationError = useCallback((error: ValidationError) => {
    setValidationErrors(prev => [...prev, error])
  }, [])

  const addCalculationError = useCallback((error: CalculationError) => {
    setCalculationErrors(prev => [...prev, error])
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([])
  }, [])

  const clearCalculationErrors = useCallback(() => {
    setCalculationErrors([])
  }, [])

  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0 || validationErrors.length > 0 || calculationErrors.length > 0
  }, [errors, validationErrors, calculationErrors])

  const value: ErrorContextType = {
    errors,
    validationErrors,
    calculationErrors,
    addError,
    removeError,
    addValidationError,
    addCalculationError,
    clearErrors,
    clearValidationErrors,
    clearCalculationErrors,
    hasErrors,
  }

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
}

// Error display components
export const ErrorDisplay: React.FC<{ errors?: string[] }> = ({ errors = [] }) => {
  if (errors.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      {errors.map((error, index) => (
        <p key={index} className="text-red-700 text-sm">
          {error}
        </p>
      ))}
    </div>
  )
}

export const ValidationErrorDisplay: React.FC = () => {
  const { validationErrors } = useError()

  if (validationErrors.length === 0) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
      <h4 className="text-yellow-800 font-medium mb-2">Validation Errors:</h4>
      {validationErrors.map((error, index) => (
        <p key={index} className="text-yellow-700 text-sm">
          <strong>{error.field}:</strong> {error.message}
        </p>
      ))}
    </div>
  )
}

export const CalculationErrorDisplay: React.FC = () => {
  const { calculationErrors } = useError()

  if (calculationErrors.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <h4 className="text-red-800 font-medium mb-2">Calculation Errors:</h4>
      {calculationErrors.map((error, index) => (
        <p key={index} className="text-red-700 text-sm">
          <strong>{error.component}:</strong> {error.message}
        </p>
      ))}
    </div>
  )
}