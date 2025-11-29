import { safeNumber, safeToFixed, validateNumberInput, validateRequired, formatCurrency, formatPercentage } from '../lib/utils'

// Test safeNumber function
console.log('=== Testing safeNumber ===')
console.log('safeNumber(123):', safeNumber(123)) // Should be 123
console.log('safeNumber("123"):', safeNumber("123")) // Should be 123
console.log('safeNumber("abc"):', safeNumber("abc")) // Should be 0
console.log('safeNumber(null):', safeNumber(null)) // Should be 0
console.log('safeNumber(undefined):', safeNumber(undefined)) // Should be 0
console.log('safeNumber("", 5):', safeNumber("", 5)) // Should be 5
console.log('safeNumber(Infinity):', safeNumber(Infinity)) // Should be 0
console.log('safeNumber(NaN):', safeNumber(NaN)) // Should be 0

// Test safeToFixed function
console.log('\n=== Testing safeToFixed ===')
console.log('safeToFixed(123.456):', safeToFixed(123.456)) // Should be "123.46"
console.log('safeToFixed(123.456, 1):', safeToFixed(123.456, 1)) // Should be "123.5"
console.log('safeToFixed("abc"):', safeToFixed("abc")) // Should be "0.00"
console.log('safeToFixed(null, 2, 10):', safeToFixed(null, 2, 10)) // Should be "10.00"

// Test validation functions
console.log('\n=== Testing validateNumberInput ===')
console.log('validateNumberInput(123):', validateNumberInput(123))
console.log('validateNumberInput("abc"):', validateNumberInput("abc"))
console.log('validateNumberInput(5, 0, 10):', validateNumberInput(5, 0, 10))
console.log('validateNumberInput(-5, 0, 10):', validateNumberInput(-5, 0, 10))
console.log('validateNumberInput(15, 0, 10):', validateNumberInput(15, 0, 10))

console.log('\n=== Testing validateRequired ===')
console.log('validateRequired("test"):', validateRequired("test"))
console.log('validateRequired(""):', validateRequired(""))
console.log('validateRequired(null):', validateRequired(null))
console.log('validateRequired(0):', validateRequired(0))

// Test formatting functions
console.log('\n=== Testing formatCurrency ===')
console.log('formatCurrency(1234.56):', formatCurrency(1234.56))
console.log('formatCurrency(1234.56, "$"):', formatCurrency(1234.56, "$"))

console.log('\n=== Testing formatPercentage ===')
console.log('formatPercentage(12.34):', formatPercentage(12.34))
console.log('formatPercentage(12.345, 1):', formatPercentage(12.345, 1))

console.log('\n=== All tests completed ===')