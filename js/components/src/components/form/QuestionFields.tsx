import {
  createStyles,
  DefaultProps,
  Grid,
  GridProps,
  Selectors,
  useComponentDefaultProps,
} from "@mantine/core"
import { AskField } from "@oes/interview-lib"
import { observer } from "mobx-react-lite"
import { Field } from "#src/components/fields/Field.js"

const questionFieldsStyles = createStyles({ root: {} })

export type QuestionFieldsProps = {
  /**
   * An object mapping names to {@link AskField} objects to show.
   */
  fields: Record<string, AskField>
} & DefaultProps<Selectors<typeof questionFieldsStyles>> &
  Omit<GridProps, "children">

/**
 * Displays the input fields for a question.
 *
 * Must have a {@link InterviewFormContext} available.
 */
export const QuestionFields = observer((props: QuestionFieldsProps) => {
  const { styles, unstyled, className, classNames, fields, ...other } =
    useComponentDefaultProps("OESIQuestionFields", {}, props)

  const { classes, cx } = questionFieldsStyles(undefined, {
    name: "OESIQuestionFields",
    classNames,
    styles,
    unstyled,
  })

  return (
    <Grid className={cx(classes.root, className)} {...other}>
      {Object.keys(fields).map((name) => (
        <Grid.Col key={name} xs={12}>
          <Field name={name} />
        </Grid.Col>
      ))}
    </Grid>
  )
})
