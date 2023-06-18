import {
  createStyles,
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
} from "@mantine/core"
import { observer } from "mobx-react-lite"
import { useContext } from "react"
import { InterviewFormContext } from "#src/components/form/Form.js"
import { DateInput, DateInputProps } from "@mantine/dates"
import dayjs, { Dayjs, isDayjs } from "dayjs"

const useStyles = createStyles(() => ({ root: {} }))

export type DateFieldProps = {
  name: string
} & DefaultProps<Selectors<typeof useStyles>> &
  Omit<
    DateInputProps,
    "name" | "error" | "value" | "onChange" | "onBlur" | "styles"
  >

/**
 * Component for a date field.
 */
export const DateField = observer((props: DateFieldProps) => {
  const { name, className, classNames, styles, unstyled, ...other } =
    useComponentDefaultProps("OESIDateField", {}, props)
  const { cx, classes } = useStyles(undefined, {
    name: "OESIDateField",
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
  if (
    typeof state.value === "string" ||
    state.value instanceof Date ||
    isDayjs(state.value)
  ) {
    value = parseDate(state.value)
  } else {
    value = null
  }

  const errorMessage = state.showError ? state.error : undefined

  return (
    <DateInput
      className={cx(classes.root, className)}
      label={state.fieldInfo.label || "Date"}
      required={!state.fieldInfo.optional}
      withAsterisk={!state.fieldInfo.optional}
      autoComplete={state.fieldInfo.autocomplete || undefined}
      inputMode="numeric"
      weekendDays={[]}
      {...other}
      error={errorMessage}
      value={value}
      onChange={(e) => {
        state.handleChange(e ?? undefined)
      }}
      onBlur={() => {
        state.handleTouch()
      }}
    />
  )
})

DateField.displayName = "DateField"

const parseDate = (obj: string | Date | Dayjs): Date | null => {
  const parsed = dayjs(obj)
  return parsed.isValid() ? parsed.toDate() : null
}
