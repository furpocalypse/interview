import { AskResult, FormState } from "@Open-Event-Systems/interview-lib"
import { useState } from "react"
import { InterviewFormContext } from "#src/components/form/Form.js"
import { Box } from "@mantine/core"
import { NumberField } from "#src/components/fields/NumberField.js"

export default {
  component: NumberField,
}

const result: AskResult = {
  type: "question",
  title: "Test",
  description: "",
  fields: {
    test: {
      type: "number",
      label: "Test Field",
      min: 0,
      max: 10,
      integer: true,
    },
  },
}

export const Default = () => {
  const [formState] = useState(() => FormState.create(result.fields))
  return (
    <Box sx={{ maxWidth: 300 }}>
      <InterviewFormContext.Provider value={formState}>
        <NumberField name="test" />
      </InterviewFormContext.Provider>
    </Box>
  )
}
