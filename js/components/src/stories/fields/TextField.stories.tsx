import { AskResult, FormState } from "@oes/interview-lib"
import { TextField } from "#src/components/fields/TextField.js"
import { useState } from "react"
import { InterviewFormContext } from "#src/components/form/Form.js"
import { Box } from "@mantine/core"

export default {
  component: TextField,
}

const result: AskResult = {
  type: "question",
  title: "Test",
  description: "",
  fields: {
    test: {
      type: "text",
      label: "Test Field",
      min: 0,
      max: 10,
    },
  },
}

export const Default = () => {
  const [formState] = useState(() => FormState.create(result.fields))
  return (
    <Box sx={{ maxWidth: 300 }}>
      <InterviewFormContext.Provider value={formState}>
        <TextField name="test" />
      </InterviewFormContext.Provider>
    </Box>
  )
}
