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

declare module "#src/types.js" {
  interface AskFieldTypes {
    text: TextField
    email: EmailField
    number: NumberField
    select: SelectField
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

registerFieldType("text", getTextValidator)
registerFieldType("email", getEmailValidator)
registerFieldType("number", getNumberValidator)
registerFieldType("select", getSelectValidator)
