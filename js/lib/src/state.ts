import { makeAutoObservable } from "mobx"
import { getFieldValidator } from "#src/fields.js"
import {
  AskField,
  Button,
  FieldValidator,
  FormValue,
  FormValues,
} from "#src/types.js"

/**
 * Field state object.
 */
export class FieldState {
  value: unknown
  touched = false

  constructor(
    public fieldInfo: AskField,
    public validator: FieldValidator,
    initialValue?: FormValue
  ) {
    this.value = initialValue ?? undefined

    makeAutoObservable(this)
  }

  /**
   * Handle the field value changing.
   * @param newValue - The new value.
   */
  handleChange = (newValue: unknown) => {
    this.value = newValue
  }

  /**
   * Set the field touched state.
   */
  handleTouch = () => {
    this.touched = true
  }

  /**
   * The validation result of the value.
   */
  get validationResult(): [true, FormValue | undefined] | [false, string] {
    return this.validator(this.value)
  }

  /**
   * Whether the current value is valid.
   */
  get isValid(): boolean {
    const [valid] = this.validationResult
    return valid
  }

  /**
   * The validated value.
   */
  get validValue(): FormValue | undefined {
    const [valid, result] = this.validationResult
    return valid ? result : undefined
  }

  /**
   * The error message, if the field value is invalid.
   */
  get error(): string | undefined {
    const [valid, error] = this.validationResult
    if (valid) {
      return undefined
    } else {
      return error
    }
  }

  /**
   * Whether an error state should be shown.
   */
  get showError(): boolean {
    return !this.isValid && this.touched
  }
}

/**
 * Manage the state of a form.
 */
export class FormState {
  submitting = false
  formEl: HTMLFormElement | null = null
  selectedButton: number | null = null

  constructor(
    public fields: Record<string, FieldState>,
    public buttons: Button[] | null = null
  ) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  /**
   * Whether the form inputs are all valid.
   */
  get isValid(): boolean {
    return Object.values(this.fields).every((f) => f.isValid)
  }

  /**
   * The valid form values.
   */
  get validValues(): FormValues {
    const validValues: FormValues = {}
    for (const key of Object.keys(this.fields)) {
      const field = this.fields[key]
      if (field.isValid && field.validValue != null) {
        validValues[key] = field.validValue
      }
    }
    return validValues
  }

  /**
   * Set the button used to submit the form.
   * @param button - The button ID.
   */
  setButton(button: number) {
    this.selectedButton = button
  }

  /**
   * Create a {FormState} from an object of {AskField}.
   * @param fields - An object mapping field names to pairs of field definitions and validator functions.
   * @param initialValues - The initial field values.
   * @returns The new {FormState}
   */
  static create(
    fields: Record<string, AskField>,
    buttons: Button[] | null = null,
    initialValues?: FormValues
  ): FormState {
    const states: Record<string, FieldState> = {}

    for (const key of Object.keys(fields)) {
      const field = fields[key]
      const validator = getFieldValidator(field)
      const initialValue = initialValues ? initialValues[key] : undefined
      const state = new FieldState(field, validator, initialValue)
      states[key] = state
    }

    return new FormState(states, buttons)
  }
}
