import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared utility functions for financial calculations
export const safeNumber = (value: string | number | null | undefined, defaultValue = 0): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue
  }
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? defaultValue : num
}

export const safeToFixed = (value: string | number | null | undefined, fractionDigits = 2, defaultValue = 0): string => {
  return safeNumber(value, defaultValue).toFixed(fractionDigits)
}

export const safePercentage = (value: string | number | null | undefined, defaultValue = 0): number => {
  const num = safeNumber(value, defaultValue)
  return Math.max(0, Math.min(100, num))
}

export const formatCurrency = (value: number, currency = '฿', decimals = 2): string => {
  return `${currency}${safeToFixed(value, decimals)}`
}

export const formatPercentage = (value: number, decimals = 2): string => {
  return `${safeToFixed(value, decimals)}%`
}

// Input validation functions
export const validateNumberInput = (value: string | number | null | undefined, min?: number, max?: number): { isValid: boolean; error?: string } => {
  const num = safeNumber(value)
  
  if (isNaN(Number(value)) && value !== '') {
    return { isValid: false, error: 'Please enter a valid number' }
  }
  
  if (min !== undefined && num < min) {
    return { isValid: false, error: `Value must be at least ${min}` }
  }
  
  if (max !== undefined && num > max) {
    return { isValid: false, error: `Value must be at most ${max}` }
  }
  
  return { isValid: true }
}

export const validateRequired = (value: string | number | null | undefined): { isValid: boolean; error?: string } => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: 'This field is required' }
  }
  return { isValid: true }
}
