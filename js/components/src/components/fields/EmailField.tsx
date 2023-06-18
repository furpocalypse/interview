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

const useStyles = createStyles(() => ({ root: {} }))

export type EmailFieldProps = {
  name: string
} & DefaultProps<Selectors<typeof useStyles>> &
  Omit<
    TextInputProps,
    "name" | "error" | "value" | "onChange" | "onBlur" | "styles"
  >

/**
 * Component for an email field.
 */
export const EmailField = observer((props: EmailFieldProps) => {
  const { name, className, classNames, styles, unstyled, ...other } =
    useComponentDefaultProps("OESIEmailField", {}, props)
  const { cx, classes } = useStyles(undefined, {
    name: "OESIEmailField",
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

  return (
    <TextInput
      className={cx(className, classes.root)}
      label={state.fieldInfo.label || undefined}
      required={!state.fieldInfo.optional}
      withAsterisk={!state.fieldInfo.optional}
      autoComplete="email"
      inputMode="email"
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

EmailField.displayName = "EmailField"
