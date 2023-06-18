import { AskResult, FormState } from "@oes/interview-lib"
import { useState } from "react"
import { InterviewFormContext } from "#src/components/form/Form.js"
import { Box, Stack, Text } from "@mantine/core"
import { DateField } from "#src/components/fields/DateField.js"
import { Observer } from "mobx-react-lite"

export default {
  component: DateField,
}

const today = new Date()

const pad = (v: number): string => {
  if (v < 10) {
    return `0${v}`
  } else {
    return `${v}`
  }
}

const result: AskResult = {
  type: "question",
  title: "Test",
  description: "",
  fields: {
    test: {
      type: "date",
      label: "Birth Date",
      min: "1900-01-01",
      max: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
        today.getDate()
      )}`,
    },
  },
}

export const Default = () => {
  const [formState] = useState(() => FormState.create(result.fields))
  return (
    <Box sx={{ maxWidth: 300 }}>
      <Stack spacing="1rem">
        <InterviewFormContext.Provider value={formState}>
          <DateField name="test" />
        </InterviewFormContext.Provider>
        <Observer>
          {() => (
            <Text>
              Result value: {formState.fields["test"].validValue ?? "undefined"}
            </Text>
          )}
        </Observer>
      </Stack>
    </Box>
  )
}
