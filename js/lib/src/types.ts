/**
 * AskField types.
 */
export interface AskFieldBase {
  type: string
  optional?: boolean | null
  default?: unknown | null
  label?: string | null
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AskFieldTypes {}

export type AskField = Extract<AskFieldTypes[keyof AskFieldTypes], AskFieldBase>

/**
 * Types that form input values may take.
 */
export type FormValue =
  | string
  | number
  | boolean
  | (string | number | boolean)[]

/**
 * Key-value mappings of form inputs.
 */
export type FormValues = Record<string, FormValue | undefined>

/**
 * Validator function. Returns true and the valid value, or false and an error.
 */
export type FieldValidator = (
  value: unknown
) => [true, FormValue | undefined] | [false, string]

/**
 * Factory function to create a validator function for a field.
 */
export type FieldValidatorFactory<
  T extends AskField["type"] = AskField["type"]
> = (field: AskField & { type: T }) => FieldValidator

/**
 * A button.
 */
export interface Button {
  label: string
  primary: boolean
  default: boolean
}

/**
 * The result of an Ask step.
 */
export interface AskResult {
  type: "question"
  title?: string | null
  description?: string | null
  fields: Record<string, AskField>
  buttons?: Button[]
}

/**
 * The result of an Exit step.
 */
export interface ExitResult {
  type: "exit"
  title: string
  description?: string | null
}

export interface IncompleteInterviewStateResponse {
  state: string
  complete?: false
  update_url: string
  content: AskResult | ExitResult | null
}

export interface CompleteInterviewStateResponse {
  state: string
  complete: true
  target_url: string
}

/**
 * A response body containing an interview state.
 */
export type InterviewStateResponse =
  | IncompleteInterviewStateResponse
  | CompleteInterviewStateResponse

/**
 * A request with a completed interview state.
 */
export interface CompleteInterviewStateRequest {
  state: string
}

/**
 * Custom metadata associated with an interview state.
 */
export interface InterviewStateMetadata {
  [key: string]: unknown
}
