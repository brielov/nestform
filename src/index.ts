/**
 * Checks if the input is a plain object (not null, not array, not Date, etc.)
 * @param input - The value to check
 * @returns True if the input is a plain object
 */
export function isObject(input: unknown): input is { [key: string]: unknown } {
  if (input === null || input === undefined) return false
  const proto = Object.getPrototypeOf(input)
  return proto === null || proto === Object.prototype
}

/**
 * Encodes a plain object into FormData
 * @param data - The object to encode
 * @returns FormData instance containing the encoded data
 * @throws Error if the input is not a plain object
 */
export function encode<T extends { [key: string]: unknown }>(
  data: T,
): FormData {
  if (!isObject(data)) {
    throw new Error('The provided data must be a plain object.')
  }

  const formData = new FormData()

  function append(key: string, value: unknown): void {
    if (isObject(value)) {
      Object.entries(value).forEach(([k, v]) => append(`${key}[${k}]`, v))
    } else if (Array.isArray(value)) {
      value.forEach((v, k) => append(`${key}[${k}]`, v))
    } else if (value instanceof Blob || typeof value === 'string') {
      formData.append(key, value)
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      formData.append(key, String(value))
    } else if (value !== null && value !== undefined) {
      // Handle other types by converting to string
      formData.append(key, String(value))
    }
  }

  Object.entries(data).forEach(([key, value]) => append(key, value))

  return formData
}

const KEY_REGEX = /[[\]]+/
const DIGIT = /^\d+$/

/**
 * Checks if a string contains only digits
 * @param str - The string to check
 * @returns True if the string contains only digits
 */
function isNumeric(str: string): boolean {
  return DIGIT.test(str)
}

export type DecodeValue = string | Blob | null | DecodeObject | DecodeArray

export interface DecodeObject {
  [key: string]: DecodeValue
}

export type DecodeArray = DecodeValue[]

export type EmptyStringStrategy = 'set null' | 'set undefined' | 'preserve'

type DecodeValueWithStrategy<T extends EmptyStringStrategy> =
  T extends 'set null'
    ? string | Blob | null | DecodeObject | DecodeArray
    : T extends 'set undefined'
      ? string | Blob | undefined | DecodeObject | DecodeArray
      : string | Blob | DecodeObject | DecodeArray

type DecodeObjectWithStrategy<T extends EmptyStringStrategy> = {
  [key: string]: DecodeValueWithStrategy<T>
}

/**
 * Decodes FormData into a plain object
 * @param formData - The FormData to decode
 * @param options - Configuration options
 * @param options.emptyString - Strategy for handling empty strings
 * @returns Decoded object with type-safe values based on the emptyString strategy
 */
export function decode<T extends EmptyStringStrategy = 'preserve'>(
  formData: FormData,
  options: { emptyString?: T } = {},
): DecodeObjectWithStrategy<T> {
  if (!(formData instanceof FormData)) {
    throw new TypeError('The provided data must be a FormData instance.')
  }

  const { emptyString = 'preserve' as T } = options
  const result = Object.create(null) as DecodeObjectWithStrategy<T>

  function setValue(
    target: Record<string, unknown>,
    keys: readonly string[],
    value: FormDataEntryValue,
  ): void {
    const len = keys.length
    let current = target

    for (let i = 0; i < len; i++) {
      const key = keys[i]
      const isLast = i === len - 1

      if (isLast) {
        if (typeof value === 'string' && value.trim() === '') {
          if (emptyString === 'set null') {
            current[key] = null
          } else if (emptyString === 'set undefined') {
            current[key] = undefined
          } else {
            current[key] = ''
          }
        } else {
          if (
            key in current &&
            typeof current[key] === 'object' &&
            current[key] !== null
          ) {
            return
          }
          current[key] = value
        }
      } else {
        if (
          !(key in current) ||
          typeof current[key] !== 'object' ||
          current[key] === null
        ) {
          current[key] = isNumeric(keys[i + 1]) ? [] : {}
        }
        current = current[key] as Record<string, unknown>
      }
    }
  }

  formData.forEach((value, key) => {
    const keys = key.split(KEY_REGEX).filter((key) => key)
    setValue(result, keys, value)
  })

  return result
}
