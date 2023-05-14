import { useContext } from "react"
import {
  FieldComponentProps,
  fieldTypeComponentRegistry,
} from "#src/components/componentMap.js"
import { InterviewFormContext } from "#src/components/form/Form.js"

/**
 * Renders the appropriate component for a field.
 */
export const Field = (props: FieldComponentProps) => {
  const form = useContext(InterviewFormContext)
  if (!form) {
    return null
  }

  const state = form.fields[props.name]
  const Component = fieldTypeComponentRegistry[state.fieldInfo.type]
  return Component ? <Component {...props} /> : null
}
