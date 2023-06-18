import {
  createStyles,
  DefaultProps,
  Selectors,
  Stack,
  StackProps,
  useComponentDefaultProps,
} from "@mantine/core"
import { AskResult, FormValues } from "@oes/interview-lib"
import { InterviewForm } from "#src/components/form/Form.js"
import {
  FormButtons,
  FormButtonsProps,
} from "#src/components/form/FormButtons.js"
import {
  QuestionFields,
  QuestionFieldsProps,
} from "#src/components/form/QuestionFields.js"
import { Markdown } from "#src/components/Markdown.js"

const questionStyles = createStyles({
  root: {
    display: "flex",
    alignItems: "stretch",
  },
  stack: {
    flex: "auto",
  },
  markdown: {},
  questionFields: {
    flex: "auto",
  },
  buttons: {},
})

export type QuestionViewProps = {
  /**
   * The {@link AskResult} to display.
   */
  content: AskResult

  /**
   * Props passed to the Stack component.
   */
  stackProps?: Partial<StackProps>

  /**
   * Props passed to the {@link QuestionFields} component.
   */
  questionFieldsProps?: Partial<QuestionFieldsProps>

  /**
   * Props passed to the {@link FormButtons} component.
   */
  formButtonsProps?: Partial<FormButtonsProps>

  /**
   * The submit handler for the form.
   */
  onSubmit: (values: FormValues, button: number | null) => Promise<void>
} & DefaultProps<Selectors<typeof questionStyles>>

/**
 * Display the form, description, inputs, and buttons for a {@link AskResult}.
 */
export const QuestionView = (props: QuestionViewProps) => {
  const {
    styles,
    unstyled,
    className,
    classNames,
    content,
    stackProps,
    questionFieldsProps,
    formButtonsProps,
    onSubmit,
    ...other
  } = useComponentDefaultProps("OESIQuestionView", {}, props)

  const { classes, cx } = questionStyles(undefined, {
    name: "OESIQuestionView",
    styles,
    unstyled,
    classNames,
  })

  return (
    <InterviewForm
      className={cx(classes.root, className)}
      {...other}
      fields={content.fields}
      onSubmit={onSubmit}
    >
      <Stack className={classes.stack} {...stackProps}>
        <Markdown className={classes.markdown}>
          {content.description || ""}
        </Markdown>
        <QuestionFields
          className={classes.questionFields}
          {...questionFieldsProps}
          fields={content.fields}
        />
        <FormButtons
          className={classes.buttons}
          justify="flex-end"
          {...formButtonsProps}
          buttons={content.buttons}
        />
      </Stack>
    </InterviewForm>
  )
}
