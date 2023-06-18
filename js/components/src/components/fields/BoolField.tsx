import {
  Checkbox,
  CheckboxGroupProps,
  createStyles,
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
} from "@mantine/core"
import { observer } from "mobx-react-lite"
import { useContext } from "react"
import { InterviewFormContext } from "#src/components/form/Form.js"

const useStyles = createStyles(() => ({
  root: {},
  checkbox: {},
}))

export type BoolFieldProps = {
  name: string
} & DefaultProps<Selectors<typeof useStyles>> &
  Omit<
    CheckboxGroupProps,
    "name" | "error" | "value" | "onChange" | "onBlur" | "styles" | "children"
  >

/**
 * Component for a boolean field.
 */
export const BoolField = observer((props: BoolFieldProps) => {
  const { name, className, classNames, styles, unstyled, ...other } =
    useComponentDefaultProps("OESIBoolField", {}, props)
  const { cx, classes } = useStyles(undefined, {
    name: "OESIBoolField",
    classNames,
    styles,
    unstyled,
  })

  const formState = useContext(InterviewFormContext)
  const state = formState?.fields[name]
  if (!formState || !state) {
    return null
  }

  const value = state.value != null ? !!state.value : false
  const errorMessage = state.showError ? state.error : undefined

  return (
    <Checkbox.Group
      className={cx(classes.root, className)}
      {...other}
      error={errorMessage}
      value={value ? [name] : []}
      onChange={(e) => {
        if (e.includes(name)) {
          state.handleChange(true)
        } else {
          state.handleChange(false)
        }
      }}
      onBlur={() => {
        state.handleTouch()
      }}
    >
      <Checkbox
        className={classes.checkbox}
        value={name}
        label={state.fieldInfo.label || "Yes"}
      />
    </Checkbox.Group>
  )
})

BoolField.displayName = "BoolField"
