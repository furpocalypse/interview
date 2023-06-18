import {
  createStyles,
  DefaultProps,
  NumberInput,
  NumberInputProps,
  Selectors,
  useComponentDefaultProps,
} from "@mantine/core"
import { observer } from "mobx-react-lite"
import { useContext } from "react"
import { InterviewFormContext } from "#src/components/form/Form.js"

const numberFieldStyles = createStyles({ root: {} })

export type NumberFieldProps = {
  name: string
} & DefaultProps<Selectors<typeof numberFieldStyles>> &
  Omit<NumberInputProps, "value" | "onChange" | "onBlur" | "styles">

/**
 * The component for a number field.
 */
export const NumberField = observer((props: NumberFieldProps) => {
  const { name, className, classNames, styles, unstyled, ...other } =
    useComponentDefaultProps("OESINumberField", {}, props)

  const { cx, classes } = numberFieldStyles(undefined, {
    name: "OESINumberField",
    classNames,
    styles,
    unstyled,
  })

  const formState = useContext(InterviewFormContext)
  const state = formState?.fields[name]
  if (!formState || !state) {
    return null
  }

  let value
  if (typeof state.value === "number") {
    value = state.value
  } else if (typeof state.value === "string") {
    const parsed = parseInt(state.value)
    value = isNaN(parsed) ? undefined : parsed
  }

  const errorMessage = state.showError ? state.error : undefined
  const autoComplete = state.fieldInfo.autocomplete ?? undefined
  const inputMode = state.fieldInfo.input_mode ?? undefined

  return (
    <NumberInput
      className={cx(className, classes.root)}
      label={state.fieldInfo.label || undefined}
      required={!state.fieldInfo.optional}
      withAsterisk={!state.fieldInfo.optional}
      autoComplete={autoComplete}
      inputMode={inputMode as NumberFieldProps["inputMode"]}
      {...other}
      error={errorMessage}
      value={value}
      onChange={(e) => {
        state.handleChange(e)
      }}
      onBlur={() => {
        state.handleTouch()
      }}
    />
  )
})

NumberField.displayName = "NumberField"
