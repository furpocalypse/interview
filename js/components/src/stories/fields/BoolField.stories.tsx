import { AskResult, FormState } from "@oes/interview-lib"
import { useState } from "react"
import { InterviewFormContext } from "#src/components/form/Form.js"
import { Box } from "@mantine/core"
import { BoolField } from "#src/components/fields/BoolField.js"

export default {
  component: BoolField,
}

const result: AskResult = {
  type: "question",
  title: "Test",
  description: "",
  fields: {
    test: {
      type: "bool",
      label: "Accept terms",
    },
  },
}

export const Default = () => {
  const [formState] = useState(() => FormState.create(result.fields))
  return (
    <Box sx={{ maxWidth: 300 }}>
      <InterviewFormContext.Provider value={formState}>
        <BoolField name="test" />
      </InterviewFormContext.Provider>
    </Box>
  )
}
