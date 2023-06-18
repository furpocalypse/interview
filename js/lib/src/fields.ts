import {
  AskField,
  AskFieldBase,
  FieldValidator,
  FieldValidatorFactory,
} from "#src/types.js"
import * as yup from "yup"
import * as EmailValidator from "email-validator"
import * as psl from "psl"

/**
 * Object mapping field types to validators.
 */
const fieldValidatorRegistry: Record<
  string,
  FieldValidatorFactory | undefined
> = {}

/**
 * Register a validator for a field type.
 * @param type - The type name.
 * @param validator - The validator.
 */
export const registerFieldType = <T extends AskField["type"]>(
  type: T,
  validatorFactory: FieldValidatorFactory<T>
) => {
  fieldValidatorRegistry[type] = validatorFactory as FieldValidatorFactory
}

/**
 * Get a field validator for a field.
 *
 * Throws an error if the field type is not found.
 *
 * @param type - The field type.
 * @returns The field validator.
 */
export const getFieldValidator = (field: AskField): FieldValidator => {
  const validatorFactory = fieldValidatorRegistry[field.type]
  if (validatorFactory == null) {
    throw new Error(`Unknown field type: ${field.type}`)
  }

  const validator = validatorFactory(field)

  return validator
}

// default fields

interface TextField extends AskFieldBase {
  type: "text"
  default?: string | null
  min: number
  max: number
  regex?: string | null
  input_mode?: string | null
  autocomplete?: string | null
}

interface EmailField extends AskFieldBase {
  type: "email"
  default?: string | null

  // not actually used...
  input_mode?: string | null
  autocomplete?: string | null
}

interface NumberField extends AskFieldBase {
  type: "number"
  default?: number | null
  min?: number | null
  max?: number | null
  integer: boolean
  input_mode?: string | null
  autocomplete?: string | null
}

interface BoolField extends AskFieldBase {
  type: "bool"
  default?: boolean | null
  input_mode?: string | null
  autocomplete?: string | null
}

interface SelectField extends AskFieldBase {
  type: "select"
  default?: number | null
  min: number
  max: number
  component: "dropdown" | "checkbox" | "radio"
  options: string[]
  input_mode?: string | null
  autocomplete?: string | null
}

interface DateField extends AskFieldBase {
  type: "date"
  default?: string | null
  input_mode?: string | null
  autocomplete?: string | null
  min?: string | null
  max?: string | null
}

declare module "#src/types.js" {
  interface AskFieldTypes {
    text: TextField
    email: EmailField
    number: NumberField
    bool: BoolField
    select: SelectField
    date: DateField
  }
}

const yupValidator = (schema: yup.Schema): FieldValidator => {
  return (value: unknown) => {
    try {
      const validValue = schema.validateSync(value)
      return [true, validValue]
    } catch (e) {
      if (e instanceof yup.ValidationError) {
        return [false, e.message]
      } else {
        throw e
      }
    }
  }
}

const getTextValidator = (field: TextField): FieldValidator => {
  let schema = yup
    .string()
    .label(field.label ?? "Field")
    .min(field.min)
    .max(field.max)

  // trim
  schema = schema.transform((v) => {
    if (typeof v === "string") {
      return v.trim()
    } else {
      return v
    }
  })

  // coerce to undefined
  if (field.optional) {
    schema = schema.transform((v) => {
      if (v === "") {
        return undefined
      } else {
        return v
      }
    })
  }

  if (field.regex) {
    const re = new RegExp(field.regex)
    schema = schema.matches(re, { message: "Enter a valid value." })
  }

  schema = field.optional ? schema : schema.required()

  return yupValidator(schema)
}

const getEmailValidator = (field: EmailField): FieldValidator => {
  let schema = yup.string().label(field.label ?? "Field")

  // trim
  schema = schema.transform((v) => {
    if (typeof v === "string") {
      return v.trim()
    } else {
      return v
    }
  })

  schema = schema
    .test("test-email", "Invalid email", (value) => {
      return !value || EmailValidator.validate(value)
    })
    .test("test-domain", "Invalid email", (value) => {
      // See the note in the server implementation on why this is done
      if (value) {
        const parts = value.split("@")
        const domain = parts[parts.length - 1]
        return psl.isValid(domain)
      } else {
        return false
      }
    })

  schema = field.optional ? schema : schema.required()

  return yupValidator(schema)
}

const getNumberValidator = (field: NumberField): FieldValidator => {
  let schema = yup
    .number()
    .label(field.label ?? "Field")
    .typeError("Enter a valid number.")

  if (field.min != null) {
    schema = schema.min(field.min)
  }

  if (field.max != null) {
    schema = schema.max(field.max)
  }

  if (field.integer) {
    schema = schema.integer().truncate()
  }

  schema = field.optional ? schema : schema.required()

  return yupValidator(schema)
}

const getBoolValidator = (field: BoolField): FieldValidator => {
  let schema = yup.bool().label(field.label ?? "Field")

  if (!field.optional) {
    schema = schema.required()
  }

  return yupValidator(schema)
}

const getSelectValidator = (field: SelectField): FieldValidator => {
  // kind of a bad way to do this
  const optionValues: number[] = []
  for (let i = 0; i < field.options.length; i++) {
    optionValues.push(i)
  }

  const optionType = yup.number().integer().oneOf(optionValues).required()

  if (field.max == 1) {
    let schema = yup
      .number()
      .integer()
      .label(field.label ?? "Field")
      .oneOf(optionValues)

    if (field.min != 0) {
      schema = schema.required()
    }
    return yupValidator(schema)
  } else {
    const schema = yup
      .array()
      .of(optionType)
      .label(field.label ?? "Field")
      .transform(filterUniqueItems)
      .min(field.min)
      .max(field.max)
      .required()

    return yupValidator(schema)
  }
}

const filterUniqueItems = (v: number[] | undefined) => {
  if (v == null) {
    return v
  }
  const set = new Set<number>(v)
  return [...set]
}

const getDateValidator = (field: DateField): FieldValidator => {
  const minDate = field.min ? parseDate(field.min) : null
  const maxDate = field.max ? parseDate(field.max) : null

  let schema = yup
    .date()
    .label(field.label ?? "Field")
    .transform((value, orig) => {
      if (value == null) {
        return value
      }

      // try parsing the date if not a valid type
      if (
        (!(value instanceof Date) || isNaN(value.getTime())) &&
        typeof orig === "string"
      ) {
        const parsed = parseDate(orig)
        if (parsed != null) {
          return parsed
        }
      }

      return value
    })
    .typeError("Enter a valid date")
    .test("check-valud", "Enter a valid date", (val) => {
      return val == null || !isNaN(val.getTime())
    })
    .test("check-min", "Enter a later date", (val) => {
      return (
        !(val instanceof Date) ||
        minDate == null ||
        compareDate(minDate, val) <= 0
      )
    })
    .test("check-max", "Enter an earlier date", (val) => {
      return (
        !(val instanceof Date) ||
        maxDate == null ||
        compareDate(maxDate, val) >= 0
      )
    })

  if (!field.optional) {
    schema = schema.defined()
  }

  return yupValidator(schema)
}

/**
 * Basic date parse function.
 *
 * @param val - The date string.
 * @returns The parsed {@link Date}, or null if invalid.
 */
export const parseDate = (val: string): Date | null => {
  const parts = val.split("-")
  if (parts.length != 3) {
    return null
  }

  if (parts[0].length != 4 || parts[1].length != 2 || parts[2].length != 2) {
    return null
  }

  const year = parseInt(parts[0])
  const month = parseInt(parts[1])
  const day = parseInt(parts[2])

  if (isNaN(year)) {
    return null
  }

  if (isNaN(month) || month < 1 || month > 12) {
    return null
  }

  if (isNaN(day) || day < 1 || day > 31) {
    return null
  }

  return new Date(year, month - 1, day)
}

/**
 * Simple date comparison.
 */
export const compareDate = (a: Date, b: Date): number => {
  const year = a.getFullYear() - b.getFullYear()
  if (year != 0) {
    return year
  }

  const month = a.getMonth() - b.getMonth()
  if (month != 0) {
    return month
  }

  return a.getDate() - b.getDate()
}

registerFieldType("text", getTextValidator)
registerFieldType("email", getEmailValidator)
registerFieldType("number", getNumberValidator)
registerFieldType("bool", getBoolValidator)
registerFieldType("select", getSelectValidator)
registerFieldType("date", getDateValidator)
