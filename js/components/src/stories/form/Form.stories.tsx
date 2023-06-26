import { AskField, Button } from "@Open-Event-Systems/interview-lib"
import { InterviewForm } from "#src/components/form/Form.js"
import { Meta } from "@storybook/react"
import { QuestionFields } from "#src/components/form/QuestionFields.js"
import { Box, Stack } from "@mantine/core"
import { FormButtons } from "#src/components/form/FormButtons.js"
import { Markdown } from "#src/components/Markdown.js"

export default {
  component: InterviewForm,
  subcomponents: {
    QuestionFields,
    FormButtons,
  },
} as Meta<typeof InterviewForm>

const fields: Record<string, AskField> = {
  field_0: {
    type: "text",
    label: "First Name",
    min: 0,
    max: 100,
    autocomplete: "given-name",
  },
  field_1: {
    type: "text",
    label: "Last Name",
    min: 0,
    max: 100,
    autocomplete: "family-name",
  },
  field_2: {
    type: "number",
    label: "Age",
    min: 0,
    max: 100,
    input_mode: "numeric",
    integer: true,
  },
}

const buttons: Button[] = [
  {
    label: "Other",
    default: false,
    primary: false,
  },
  {
    label: "Next",
    default: true,
    primary: true,
  },
]

export const Default = () => {
  return (
    <Box sx={{ maxWidth: 350, border: "#000 dashed 1px", padding: 12 }}>
      <InterviewForm
        sx={{ minHeight: 350 }}
        fields={fields}
        initialValues={{
          field_1: "Initial Value",
        }}
        onSubmit={async () => {
          await new Promise((r) => window.setTimeout(r, 1500))
        }}
      >
        <Stack>
          <Box sx={{ flexGrow: 1 }}>
            <Markdown>Example **markdown** formatted question.</Markdown>
          </Box>
          <QuestionFields fields={fields} />
          <FormButtons justify="flex-end" buttons={buttons} />
        </Stack>
      </InterviewForm>
    </Box>
  )
}
