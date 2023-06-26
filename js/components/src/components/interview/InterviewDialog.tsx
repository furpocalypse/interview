import {
  createStyles,
  DefaultProps,
  Modal,
  ModalProps,
  Selectors,
  useComponentDefaultProps,
} from "@mantine/core"
import {
  FormValues,
  InterviewStateStore,
} from "@open-event-systems/interview-lib"
import { observer } from "mobx-react-lite"
import { ExitView, ExitViewProps } from "#src/components/interview/ExitView.js"
import {
  QuestionView,
  QuestionViewProps,
} from "#src/components/interview/QuestionView.js"

const dialogStyles = createStyles({
  root: {},
  title: {},
  question: {},
  exit: {},
})

export type InterviewDialogProps = {
  /**
   * The current state record ID.
   */
  recordId: string

  /**
   * The {@link InterviewStateStore}.
   */
  stateStore: InterviewStateStore

  /**
   * The form submit handler.
   */
  onSubmit: (values: FormValues, button: number | null) => Promise<void>

  /**
   * Props passed down to the {@link QuestionView} component.
   */
  questionViewProps?: Partial<QuestionViewProps>

  /**
   * Props passed down to the {@link ExitView} component.
   */
  exitViewProps?: Partial<ExitViewProps>
} & DefaultProps<Selectors<typeof dialogStyles>> &
  Omit<ModalProps, "children" | "title" | "onSubmit" | "styles">

/**
 * A component that renders interview content in a dialog.
 */
export const InterviewDialog = observer((props: InterviewDialogProps) => {
  const {
    styles,
    unstyled,
    className,
    classNames,
    recordId,
    stateStore,
    onSubmit,
    onClose,
    questionViewProps,
    exitViewProps,
    ...other
  } = useComponentDefaultProps("OESIInterviewDialog", {}, props)

  const { classes, cx } = dialogStyles(undefined, {
    name: "OESIInterviewDialog",
    classNames,
    styles,
    unstyled,
  })

  const record = stateStore.getRecord(recordId)
  const content =
    record?.stateResponse.complete != true
      ? record?.stateResponse.content
      : null
  let children

  switch (content?.type) {
    case "question":
      children = (
        <QuestionView
          key={recordId}
          className={classes.question}
          {...questionViewProps}
          onSubmit={onSubmit}
          content={content}
        />
      )
      break
    case "exit":
      children = (
        <ExitView
          key={recordId}
          className={classes.exit}
          {...exitViewProps}
          content={content}
          onClose={() => onClose()}
        />
      )
      break
    default:
      children = null
      break
  }

  return (
    <Modal
      className={cx(classes.root, className)}
      {...other}
      onClose={onClose}
      title={content?.title ? content.title : undefined}
    >
      {children}
    </Modal>
  )
})
