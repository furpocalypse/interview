import {
  Box,
  createStyles,
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
} from "@mantine/core"
import { AskField, Button, FormState, FormValues } from "@oes/interview-lib"
import { action, runInAction } from "mobx"
import { observer, useLocalObservable } from "mobx-react-lite"
import { createContext, FormHTMLAttributes, ReactNode } from "react"

const formStyles = createStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
  },
}))

export type InterviewFormProps = {
  /**
   * An object mapping field names to {@link AskField} objects.
   */
  fields: Record<string, AskField>

  /**
   * An array of custom submit buttons for the form.
   */
  buttons?: Button[]

  /**
   * An object of initial values for the fields.
   */
  initialValues?: FormValues

  /**
   * The submit handler.
   */
  onSubmit: (values: FormValues, button: number | null) => Promise<void>

  children?: ReactNode
} & DefaultProps<Selectors<typeof formStyles>> &
  Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children">

/**
 * A component that manages the state of fields in an interview question.
 *
 * Renders children inside a <form> and manages its submit events.
 *
 * Provides the state as {@link InterviewFormContext}.
 */
export const InterviewForm = observer((props: InterviewFormProps) => {
  const {
    styles,
    unstyled,
    className,
    classNames,
    fields,
    buttons,
    initialValues,
    onSubmit,
    children,
    ...other
  } = useComponentDefaultProps("InterviewForm", {}, props)

  const { classes, cx } = formStyles(undefined, {
    name: "InterviewForm",
    classNames,
    styles,
    unstyled,
  })

  const state = useLocalObservable(() =>
    FormState.create(fields, buttons, initialValues)
  )

  const handleSubmit = action(async () => {
    // set all fields to touched
    for (const key of Object.keys(state.fields)) {
      state.fields[key].touched = true
    }

    if (state.submitting || !state.isValid) {
      return
    }

    state.submitting = true

    try {
      await onSubmit(state.validValues, state.selectedButton)
    } catch (_e) {
      runInAction(() => {
        state.submitting = false
      })
    }
  })

  return (
    <Box
      component="form"
      className={cx(classes.root, className)}
      {...other}
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      ref={action((el: HTMLFormElement | null) => {
        state.formEl = el
      })}
    >
      <InterviewFormContext.Provider value={state}>
        {children}
      </InterviewFormContext.Provider>
    </Box>
  )
})

InterviewForm.displayName = "InterviewForm"

export const InterviewFormContext = createContext<FormState | null>(null)
