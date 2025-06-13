import { describe, expect, it } from 'vitest'
import { decode, encode, isObject } from '../src'

describe('isObject', () => {
  it('should return true for plain objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ key: 'value' })).toBe(true)
    expect(isObject(Object.create(null))).toBe(true)
  })

  it('should return false for non-plain objects', () => {
    expect(isObject(null)).toBe(false)
    expect(isObject(undefined)).toBe(false)
    expect(isObject([])).toBe(false)
    expect(isObject(new Date())).toBe(false)
    expect(isObject(new Map())).toBe(false)
    expect(isObject(new Set())).toBe(false)
    expect(isObject(() => {})).toBe(false)
    expect(isObject('string')).toBe(false)
    expect(isObject(123)).toBe(false)
    expect(isObject(true)).toBe(false)
  })
})

describe('encode', () => {
  it('should throw error for non-object input', () => {
    expect(() => encode(null as any)).toThrow(
      'The provided data must be a plain object.',
    )
    expect(() => encode(undefined as any)).toThrow(
      'The provided data must be a plain object.',
    )
    expect(() => encode([] as any)).toThrow(
      'The provided data must be a plain object.',
    )
  })

  it('should encode simple key-value pairs', () => {
    const data = {
      name: 'John',
      age: 30,
      isActive: true,
    }
    const formData = encode(data)
    expect(formData.get('name')).toBe('John')
    expect(formData.get('age')).toBe('30')
    expect(formData.get('isActive')).toBe('true')
  })

  it('should encode nested objects', () => {
    const data = {
      user: {
        name: 'John',
        address: {
          city: 'New York',
          zip: 10001,
        },
      },
    }
    const formData = encode(data)
    expect(formData.get('user[name]')).toBe('John')
    expect(formData.get('user[address][city]')).toBe('New York')
    expect(formData.get('user[address][zip]')).toBe('10001')
  })

  it('should encode arrays', () => {
    const data = {
      tags: ['js', 'ts', 'react'],
      numbers: [1, 2, 3],
    }
    const formData = encode(data)
    expect(formData.get('tags[0]')).toBe('js')
    expect(formData.get('tags[1]')).toBe('ts')
    expect(formData.get('tags[2]')).toBe('react')
    expect(formData.get('numbers[0]')).toBe('1')
    expect(formData.get('numbers[1]')).toBe('2')
    expect(formData.get('numbers[2]')).toBe('3')
  })

  it('should handle Blob values', () => {
    const blob = new Blob(['test'], { type: 'text/plain' })
    const data = {
      file: blob,
    }
    const formData = encode(data)
    const result = formData.get('file') as File
    expect(result).toBeInstanceOf(File)
    expect(result.type).toBe('text/plain')
    expect(result.size).toBe(4)
  })

  it('should handle null and undefined values', () => {
    const data = {
      nullValue: null,
      undefinedValue: undefined,
    }
    const formData = encode(data)
    expect(formData.has('nullValue')).toBe(false)
    expect(formData.has('undefinedValue')).toBe(false)
  })

  it('should handle complex nested structures', () => {
    const data = {
      users: [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ],
      settings: {
        theme: 'dark',
        notifications: {
          email: true,
          push: false,
        },
      },
    }
    const formData = encode(data)
    expect(formData.get('users[0][name]')).toBe('John')
    expect(formData.get('users[0][age]')).toBe('30')
    expect(formData.get('users[1][name]')).toBe('Jane')
    expect(formData.get('users[1][age]')).toBe('25')
    expect(formData.get('settings[theme]')).toBe('dark')
    expect(formData.get('settings[notifications][email]')).toBe('true')
    expect(formData.get('settings[notifications][push]')).toBe('false')
  })
})

describe('decode', () => {
  it('should throw error for non-FormData input', () => {
    expect(() => decode(null as any)).toThrow(
      'The provided data must be a FormData instance.',
    )
    expect(() => decode(undefined as any)).toThrow(
      'The provided data must be a FormData instance.',
    )
    expect(() => decode({} as any)).toThrow(
      'The provided data must be a FormData instance.',
    )
  })

  it('should decode simple key-value pairs', () => {
    const formData = new FormData()
    formData.append('name', 'John')
    formData.append('age', '30')
    formData.append('isActive', 'true')

    const result = decode(formData)
    expect(result).toEqual({
      name: 'John',
      age: '30',
      isActive: 'true',
    })
  })

  it('should decode nested objects', () => {
    const formData = new FormData()
    formData.append('user[name]', 'John')
    formData.append('user[address][city]', 'New York')
    formData.append('user[address][zip]', '10001')

    const result = decode(formData)
    expect(result).toEqual({
      user: {
        name: 'John',
        address: {
          city: 'New York',
          zip: '10001',
        },
      },
    })
  })

  it('should decode arrays', () => {
    const formData = new FormData()
    formData.append('tags[0]', 'js')
    formData.append('tags[1]', 'ts')
    formData.append('tags[2]', 'react')

    const result = decode(formData)
    expect(result).toEqual({
      tags: ['js', 'ts', 'react'],
    })
  })

  it('should handle Blob values', () => {
    const blob = new Blob(['test'], { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', blob)

    const result = decode(formData)
    const file = result.file as File
    expect(file).toBeInstanceOf(File)
    expect(file.type).toBe('text/plain')
    expect(file.size).toBe(4)
  })

  it('should handle empty string strategy', () => {
    const formData = new FormData()
    formData.append('empty', '')

    expect(decode(formData, { emptyString: 'preserve' })).toEqual({ empty: '' })
    expect(decode(formData, { emptyString: 'set null' })).toEqual({
      empty: null,
    })
    expect(decode(formData, { emptyString: 'set undefined' })).toEqual({
      empty: undefined,
    })
  })

  it('should handle complex nested structures', () => {
    const formData = new FormData()
    formData.append('users[0][name]', 'John')
    formData.append('users[0][age]', '30')
    formData.append('users[1][name]', 'Jane')
    formData.append('users[1][age]', '25')
    formData.append('settings[theme]', 'dark')
    formData.append('settings[notifications][email]', 'true')
    formData.append('settings[notifications][push]', 'false')

    const result = decode(formData)
    expect(result).toEqual({
      users: [
        { name: 'John', age: '30' },
        { name: 'Jane', age: '25' },
      ],
      settings: {
        theme: 'dark',
        notifications: {
          email: 'true',
          push: 'false',
        },
      },
    })
  })

  it('should handle numeric array indices', () => {
    const formData = new FormData()
    formData.append('items[0]', 'first')
    formData.append('items[1]', 'second')
    formData.append('items[2]', 'third')

    const result = decode(formData)
    expect(result).toEqual({
      items: ['first', 'second', 'third'],
    })
  })

  it('should handle mixed array and object structures', () => {
    const formData = new FormData()
    formData.append('data[0][id]', '1')
    formData.append('data[0][name]', 'Item 1')
    formData.append('data[1][id]', '2')
    formData.append('data[1][name]', 'Item 2')

    const result = decode(formData)
    expect(result).toEqual({
      data: [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ],
    })
  })
})
