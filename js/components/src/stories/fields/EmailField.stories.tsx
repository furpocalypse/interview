import { AskResult, FormState } from "@Open-Event-Systems/interview-lib"
import { EmailField } from "#src/components/fields/EmailField.js"
import { useState } from "react"
import { InterviewFormContext } from "#src/components/form/Form.js"
import { Box } from "@mantine/core"

export default {
  component: EmailField,
}

const result: AskResult = {
  type: "question",
  title: "Test",
  description: "",
  fields: {
    test: {
      type: "email",
      label: "Email Field",
    },
  },
}

export const Default = () => {
  const [formState] = useState(() => FormState.create(result.fields))
  return (
    <Box sx={{ maxWidth: 300 }}>
      <InterviewFormContext.Provider value={formState}>
        <EmailField name="test" />
      </InterviewFormContext.Provider>
    </Box>
  )
}
