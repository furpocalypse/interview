import { Box } from "@mantine/core"
import { AskResult, FormState } from "@open-event-systems/interview-lib"
import { InterviewFormContext } from "#src/components/form/Form.js"
import { SelectField } from "#src/components/fields/SelectField.js"

export default {
  component: SelectField,
}

const dropdown: AskResult = {
  type: "question",
  title: "Test",
  description: "",
  fields: {
    test: {
      type: "select",
      label: "Choice",
      component: "dropdown",
      min: 1,
      max: 1,
      options: ["Option 1", "Option 2", "Option 3"],
    },
  },
}

const radio: AskResult = {
  type: "question",
  title: "Test",
  description: "",
  fields: {
    test: {
      type: "select",
      label: "Choice",
      component: "radio",
      min: 1,
      max: 1,
      options: ["Option 1", "Option 2", "Option 3"],
    },
  },
}
const checkbox: AskResult = {
  type: "question",
  title: "Test",
  description: "",
  fields: {
    test: {
      type: "select",
      label: "Choice",
      component: "checkbox",
      min: 1,
      max: 2,
      options: ["Option 1", "Option 2", "Option 3"],
    },
  },
}

export const Dropdown = () => {
  const state = FormState.create(dropdown.fields)
  return (
    <Box sx={{ maxWidth: 300 }}>
      <InterviewFormContext.Provider value={state}>
        <SelectField name="test" />
      </InterviewFormContext.Provider>
    </Box>
  )
}

export const Radio = () => {
  const state = FormState.create(radio.fields)
  return (
    <Box sx={{ maxWidth: 300 }}>
      <InterviewFormContext.Provider value={state}>
        <SelectField name="test" />
      </InterviewFormContext.Provider>
    </Box>
  )
}

export const Checkbox = () => {
  const state = FormState.create(checkbox.fields)
  return (
    <Box sx={{ maxWidth: 300 }}>
      <InterviewFormContext.Provider value={state}>
        <SelectField name="test" />
      </InterviewFormContext.Provider>
    </Box>
  )
}
