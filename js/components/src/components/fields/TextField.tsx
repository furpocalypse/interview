import {
  createStyles,
  DefaultProps,
  Selectors,
  TextInput,
  TextInputProps,
  useComponentDefaultProps,
} from "@mantine/core"
import { observer } from "mobx-react-lite"
import { useContext } from "react"
import { InterviewFormContext } from "#src/components/form/Form.js"

const textStyles = createStyles(() => ({ root: {} }))

export type TextFieldProps = {
  name: string
} & DefaultProps<Selectors<typeof textStyles>> &
  Omit<TextInputProps, "name" | "error" | "value" | "onChange" | "onBlur">

/**
 * Component for a text field.
 */
export const TextField = observer((props: TextFieldProps) => {
  const { name, className, classNames, styles, unstyled, ...other } =
    useComponentDefaultProps("OESITextField", {}, props)
  const { cx, classes } = textStyles(undefined, {
    name: "OESITextField",
    classNames,
    styles,
    unstyled,
  })

  const formState = useContext(InterviewFormContext)
  const state = formState?.fields[name]
  if (!formState || !state) {
    return null
  }

  const value = state.value != null ? state.value.toString() : ""
  const errorMessage = state.showError ? state.error : undefined
  const autoComplete = state.fieldInfo.autocomplete ?? undefined
  const inputMode = state.fieldInfo.input_mode ?? undefined

  return (
    <TextInput
      className={cx(className, classes.root)}
      label={state.fieldInfo.label || undefined}
      required={!state.fieldInfo.optional}
      withAsterisk={!state.fieldInfo.optional}
      autoComplete={autoComplete}
      inputMode={inputMode as TextFieldProps["inputMode"]}
      {...other}
      error={errorMessage}
      value={value}
      onChange={(e) => {
        state.handleChange(e.target.value)
      }}
      onBlur={() => {
        state.handleTouch()
      }}
    />
  )
})

TextField.displayName = "TextField"
