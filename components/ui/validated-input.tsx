import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateNumberInput, validateRequired, safeNumber } from '@/lib/utils'

interface ValidatedInputProps {
  id: string
  label: string
  value: number | string
  onChange: (value: number) => void
  type?: 'number' | 'text'
  min?: number
  max?: number
  step?: number
  required?: boolean
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: string
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'number',
  min,
  max,
  step = 0.1,
  required = false,
  placeholder,
  className = '',
  disabled = false,
  error: externalError,
}) => {
  const [internalError, setInternalError] = React.useState<string>('')
  const [touched, setTouched] = React.useState(false)

  const error = externalError || internalError
  const hasError = !!error && touched

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setTouched(true)

    // Validate based on requirements
    if (required) {
      const requiredValidation = validateRequired(inputValue)
      if (!requiredValidation.isValid) {
        setInternalError(requiredValidation.error || '')
        return
      }
    }

    if (type === 'number' && inputValue !== '') {
      const numberValidation = validateNumberInput(inputValue, min, max)
      if (!numberValidation.isValid) {
        setInternalError(numberValidation.error || '')
        return
      }
    }

    // Clear error if validation passes
    setInternalError('')
    
    // Convert to number for number inputs
    const finalValue = type === 'number' ? safeNumber(inputValue) : inputValue
    onChange(finalValue as number)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        step={type === 'number' ? step : undefined}
        min={type === 'number' ? min : undefined}
        max={type === 'number' ? max : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className={`${className} ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
      {hasError && (
        <p id={`${id}-error`} className="text-red-500 text-xs mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface ValidatedSelectProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: string
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  error: externalError,
}) => {
  const [internalError, setInternalError] = React.useState<string>('')
  const [touched, setTouched] = React.useState(false)

  const error = externalError || internalError
  const hasError = !!error && touched

  const handleChange = (selectedValue: string) => {
    setTouched(true)

    if (required && !selectedValue) {
      setInternalError('This field is required')
      return
    }

    setInternalError('')
    onChange(selectedValue)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setTouched(true)}
        disabled={disabled}
        className={`
          flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
          ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
          placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed 
          disabled:opacity-50 ${className} ${hasError ? 'border-red-500 focus:border-red-500' : ''}
        `}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && (
        <p id={`${id}-error`} className="text-red-500 text-xs mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Form wrapper that handles validation state
interface ValidatedFormProps {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
}

export const ValidatedForm: React.FC<ValidatedFormProps> = ({
  children,
  onSubmit,
  className = '',
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {children}
    </form>
  )
}