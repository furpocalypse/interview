import { getFieldValidator } from "#src/fields.js"
import { FieldState, FormState } from "#src/state.js"
import { AskField, AskResult } from "#src/types.js"

const fields: Record<string, AskField> = {
  foo: {
    type: "text",
    min: 2,
    max: 300,
    optional: true,
  },
}

test("form state can be created", () => {
  const fieldStates: Record<string, FieldState> = {
    foo: new FieldState(fields.foo, getFieldValidator(fields.foo)),
  }
  const state = new FormState(fieldStates)
  expect(Array.from(Object.keys(state.fields))).toStrictEqual(["foo"])
})

test("field state updates values", () => {
  const fieldStates: Record<string, FieldState> = {
    foo: new FieldState(fields.foo, getFieldValidator(fields.foo)),
  }
  const state = new FormState(fieldStates)

  const field = state.fields.foo
  expect(field.value).toBeUndefined()
  field.handleChange("bar")
  expect(field.value).toBe("bar")
})

test("field state validates values", () => {
  const fieldStates: Record<string, FieldState> = {
    foo: new FieldState(fields.foo, getFieldValidator(fields.foo)),
  }
  const state = new FormState(fieldStates)

  const field = state.fields.foo
  field.handleChange("b")
  expect(field.isValid).toBe(false)
  expect(typeof field.error).toBe("string")
  field.handleChange("ba")
  expect(field.isValid).toBe(true)
  expect(field.error).toBeUndefined()
})

test("field state checks touched", () => {
  const fieldStates: Record<string, FieldState> = {
    foo: new FieldState(fields.foo, getFieldValidator(fields.foo)),
  }
  const state = new FormState(fieldStates)

  const field = state.fields.foo
  field.handleChange("b")
  expect(field.touched).toBe(false)
  expect(field.showError).toBe(false)
  field.handleTouch()
  expect(field.touched).toBe(true)
  expect(field.showError).toBe(true)
})

test("form state gets validated values", () => {
  const fieldStates: Record<string, FieldState> = {
    foo: new FieldState(fields.foo, getFieldValidator(fields.foo)),
  }
  const state = new FormState(fieldStates)

  const field = state.fields.foo
  field.handleChange("b")

  expect(state.isValid).toBe(false)

  field.handleChange("bar")
  expect(state.isValid).toBe(true)
  expect(state.validValues).toStrictEqual({ foo: "bar" })
})

test("form state can be created from field definitions", () => {
  const state = FormState.create(fields)
  const field = state.fields.foo
  expect(field).toBeDefined()
  field.handleChange("test")
  expect(state.validValues).toStrictEqual({ foo: "test" })
})

test("form state casts values", () => {
  const state = FormState.create({
    foo: {
      type: "number",
      optional: false,
      integer: true,
    },
  })
  const field = state.fields.foo
  field.handleChange("123")
  expect(state.validValues?.foo).toBe(123)
})

test("form state sets initial values", () => {
  const state = FormState.create(
    {
      foo: {
        type: "number",
        optional: false,
        integer: true,
      },
    },
    null,
    { foo: 123 }
  )
  expect(state.validValues?.foo).toBe(123)
})

const askResult: AskResult = {
  type: "question",
  title: null,
  description: null,
  fields: {
    field_0: {
      type: "text",
      min: 0,
      max: 4,
      optional: false,
    },
  },
}

test("form state validates according to field definitions", () => {
  const jsonSchema = askResult.fields
  const state = FormState.create(jsonSchema)
  expect(state.isValid).toBe(false)
  state.fields.field_0.handleChange("asdf")
  expect(state.isValid).toBe(true)
  expect(state.validValues).toStrictEqual({ field_0: "asdf" })
  state.fields.field_0.handleChange("asdf1234")
  expect(state.isValid).toBe(false)
})

test("field state supports optional status", () => {
  const state = FormState.create({
    field_0: {
      type: "text",
      min: 0,
      max: 4,
      optional: true,
    },
  })

  expect(state.fields.field_0.validValue).toBeUndefined()
  expect(state.fields.field_0.isValid).toBe(true)
  expect(state.validValues).toStrictEqual({})
})

test("text field trims strings", () => {
  const state = FormState.create({
    field_0: {
      type: "text",
      min: 0,
      max: 4,
      optional: true,
    },
  })

  state.fields.field_0.handleChange(" asdf ")
  expect(state.validValues).toStrictEqual({ field_0: "asdf" })
  state.fields.field_0.handleChange("  ")
  expect(state.validValues).toStrictEqual({})
  state.fields.field_0.handleChange("")
  expect(state.validValues).toStrictEqual({})
})

test("text field trims strings and checks undefined", () => {
  const state = FormState.create({
    field_0: {
      type: "text",
      min: 0,
      max: 4,
      optional: false,
    },
  })

  state.fields.field_0.handleChange("  ")
  expect(state.isValid).toBe(false)
})

test("select schemas cast values correctly", () => {
  const state = FormState.create({
    field_0: {
      type: "select",
      component: "dropdown",
      min: 0,
      max: 1,
      options: ["A", "B", "C"],
      optional: true,
    },
  })

  state.fields.field_0.handleChange(1)
  expect(state.fields.field_0.validValue).toStrictEqual(1)
  state.fields.field_0.handleChange([1])
  expect(state.fields.field_0.validValue).toStrictEqual(1)
  state.fields.field_0.handleChange([])
  expect(state.fields.field_0.validValue).toBeUndefined()
  state.fields.field_0.handleChange(undefined)
  expect(state.fields.field_0.validValue).toBeUndefined()
})

test("multi select schemas cast values correctly", () => {
  const state = FormState.create({
    field_0: {
      type: "select",
      component: "dropdown",
      min: 1,
      max: 3,
      options: ["A", "B", "C"],
    },
  })

  state.fields.field_0.handleChange([0, 2])
  expect(state.fields.field_0.validValue).toStrictEqual([0, 2])
})

test("select schemas validate min/max", () => {
  const state = FormState.create({
    field_0: {
      type: "select",
      component: "dropdown",
      min: 1,
      max: 2,
      options: ["A", "B", "C"],
    },
  })

  state.fields.field_0.handleChange([0, 2])
  expect(state.fields.field_0.isValid).toBe(true)
  state.fields.field_0.handleChange([0, 1, 2])
  expect(state.fields.field_0.isValid).toBe(false)
  state.fields.field_0.handleChange([0])
  expect(state.fields.field_0.isValid).toBe(true)
  state.fields.field_0.handleChange([3])
  expect(state.fields.field_0.isValid).toBe(false)
  state.fields.field_0.handleChange([])
  expect(state.fields.field_0.isValid).toBe(false)
  state.fields.field_0.handleChange([0, 0, 0, 1, 1])
  expect(state.fields.field_0.isValid).toBe(true)
  expect(state.fields.field_0.validValue).toStrictEqual([0, 1])
  state.fields.field_0.handleChange([0, 0, 0, 1, 1, 2, 2, 2])
  expect(state.fields.field_0.isValid).toBe(false)
})
