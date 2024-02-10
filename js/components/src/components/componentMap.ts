import { AskFieldTypes } from "@open-event-systems/interview-lib"
import { ComponentType } from "react"
import { NumberField } from "#src/components/fields/NumberField.js"
import { SelectField } from "#src/components/fields/SelectField.js"
import { TextField } from "#src/components/fields/TextField.js"
import { EmailField } from "#src/components/fields/EmailField.js"
import { BoolField } from "#src/components/fields/BoolField.js"

/**
 * The common props for every question field component.
 */
export type FieldComponentProps = {
  /**
   * The name of the field the component is for.
   */
  name: string
}

/**
 * Object mapping field types to components.
 */
export const fieldTypeComponentRegistry: Record<
  string,
  ComponentType<FieldComponentProps> | undefined
> = {}

/**
 * Register a component for a field type.
 * @param type - The field tyoe.
 * @param componentType - The component type.
 */
export const registerFieldComponent = (
  type: keyof AskFieldTypes,
  componentType: ComponentType<FieldComponentProps>
) => {
  fieldTypeComponentRegistry[type] = componentType
}

registerFieldComponent("text", TextField)
registerFieldComponent("email", EmailField)
registerFieldComponent("number", NumberField)
registerFieldComponent("bool", BoolField)
registerFieldComponent("select", SelectField)
