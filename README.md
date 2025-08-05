# NestForm

A lightweight TypeScript utility for encoding and decoding nested FormData objects. Perfect for handling complex form data structures in modern web applications.

## Features

- 🔄 Bidirectional conversion between objects and FormData
- 🎯 Full TypeScript support with type safety
- 🌳 Handles nested objects and arrays
- 🎨 Configurable empty string handling
- 📦 Zero dependencies
- 🧪 Fully tested
- 🚀 Tree-shakeable

## Installation

```bash
# Using npm
npm install nestform

# Using yarn
yarn add nestform

# Using pnpm
pnpm add nestform
```

## Usage

### Encoding Objects to FormData

```typescript
import { encode } from 'nestform'

const data = {
  name: 'John Doe',
  age: 30,
  address: {
    street: '123 Main St',
    city: 'New York',
  },
  hobbies: ['reading', 'gaming'],
  createdAt: new Date(),
}

const formData = encode(data)
// FormData now contains:
// name: "John Doe"
// age: "30"
// address[street]: "123 Main St"
// address[city]: "New York"
// hobbies[0]: "reading"
// hobbies[1]: "gaming"
// createdAt: "2024-01-15T10:30:00.000Z" (ISO format by default)
```

### Date Handling

You can configure how Date objects are encoded:

```typescript
// ISO format (default)
const formData1 = encode(data, { dateFormat: 'iso' })

// Unix timestamp
const formData2 = encode(data, { dateFormat: 'timestamp' })

// Date.toString() format
const formData3 = encode(data, { dateFormat: 'string' })
```

### Decoding FormData to Objects

```typescript
import { decode } from 'nestform'

const formData = new FormData()
formData.append('name', 'John Doe')
formData.append('age', '30')
formData.append('address[street]', '123 Main St')
formData.append('address[city]', 'New York')
formData.append('hobbies[0]', 'reading')
formData.append('hobbies[1]', 'gaming')

const data = decode(formData)
// Returns:
// {
//   name: "John Doe",
//   age: "30",
//   address: {
//     street: "123 Main St",
//     city: "New York"
//   },
//   hobbies: ["reading", "gaming"]
// }
```

### Handling Empty Strings

You can configure how empty strings are handled during decoding:

```typescript
// Preserve empty strings (default)
const data1 = decode(formData, { emptyString: 'preserve' })

// Convert empty strings to null
const data2 = decode(formData, { emptyString: 'set null' })

// Convert empty strings to undefined
const data3 = decode(formData, { emptyString: 'set undefined' })
```

## API Reference

### `encode(data: object, options?: EncodeOptions): FormData`

Converts a plain object into FormData.

- `data`: A plain object to encode
- `options.dateFormat`: How to handle Date objects
  - `'iso'`: Convert to ISO 8601 string (default)
  - `'timestamp'`: Convert to Unix timestamp (number)
  - `'string'`: Use Date.toString() method
- Returns: A FormData instance

### `decode(formData: FormData, options?: { emptyString?: 'preserve' | 'set null' | 'set undefined' }): object`

Converts FormData back into a plain object.

- `formData`: A FormData instance to decode
- `options.emptyString`: Strategy for handling empty strings
  - `'preserve'`: Keep empty strings as is (default)
  - `'set null'`: Convert empty strings to null
  - `'set undefined'`: Convert empty strings to undefined
- Returns: A decoded object

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the library
pnpm build

# Run type checking
pnpm typecheck

# Format code
pnpm format

# Lint code
pnpm lint
```

## License

[MIT](./LICENSE) License © 2025 [Gabriel Vaquer](https://github.com/brielov)
