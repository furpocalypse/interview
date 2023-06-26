import {
  Checkbox,
  CheckboxGroupProps,
  createStyles,
  DefaultProps,
  Radio,
  RadioGroupProps,
  Select,
  Selectors,
  SelectProps,
  Stack,
  StackProps,
  useComponentDefaultProps,
} from "@mantine/core"
import { AskField, FieldState } from "@open-event-systems/interview-lib"
import { observer } from "mobx-react-lite"
import { useContext } from "react"
import { InterviewFormContext } from "#src/components/form/Form.js"

export type SelectFieldProps = {
  name: string
}

/**
 * Renders the appropriate type of component for a select field.
 */
export const SelectField = observer((props: SelectFieldProps) => {
  const { name } = props

  const formState = useContext(InterviewFormContext)
  const state = formState?.fields[name]
  if (!formState || !state) {
    return null
  }

  const fieldInfo = state.fieldInfo as AskField & {
    component: "radio" | "checkbox" | "dropdown"
  }

  const component = fieldInfo.component

  if (component == "radio") {
    return <RadioSelectField name={name} />
  } else if (component == "checkbox") {
    return <CheckboxSelectField name={name} />
  } else {
    return <DropdownSelectField name={name} />
  }
})

SelectField.displayName = "SelectField"

const selectStyles = createStyles({ root: {} })

export type DropdownSelectFieldProps = {
  name: string
} & DefaultProps<Selectors<typeof selectStyles>> &
  Omit<SelectProps, "data" | "onChange" | "onBlur" | "value" | "styles">

/**
 * A dropdown select component.
 */
export const DropdownSelectField = observer(
  (props: DropdownSelectFieldProps) => {
    const { styles, className, classNames, unstyled, name, ...other } =
      useComponentDefaultProps("OESIDropdownSelectField", {}, props)

    const { classes, cx } = selectStyles(undefined, {
      name: "OESIDropdownSelectField",
      classNames,
      styles,
      unstyled,
    })

    const formState = useContext(InterviewFormContext)
    const state = formState?.fields[name]
    if (!formState || !state) {
      return null
    }

    const autoComplete = state.fieldInfo.autocomplete ?? undefined
    const errorMessage = state.showError ? state.error : undefined

    return (
      <Select
        className={cx(className, classes.root)}
        label={state.fieldInfo.label || undefined}
        required={!state.fieldInfo.optional}
        {...other}
        error={errorMessage}
        value={state.value != null ? `${state.value}` : null}
        onChange={(e) => {
          state.handleChange(e ?? undefined)
        }}
        onDropdownClose={() => {
          state.handleTouch()
        }}
        data={getOptions(state)}
        autoComplete={autoComplete}
      />
    )
  }
)

DropdownSelectField.displayName = "DropdownSelectField"

const radioStyles = createStyles({
  root: {},
  radio: {},
})

export type RadioSelectFieldProps = {
  name: string
  StackProps?: Partial<StackProps>
} & DefaultProps<Selectors<typeof radioStyles>> &
  Omit<RadioGroupProps, "children" | "value" | "onChange" | "onBlur">

/**
 * A radio button group select component.
 */
export const RadioSelectField = observer((props: RadioSelectFieldProps) => {
  const {
    name,
    className,
    classNames,
    styles,
    unstyled,
    StackProps,
    ...other
  } = useComponentDefaultProps("OESIRadioSelectField", {}, props)

  const { classes, cx } = radioStyles(undefined, {
    name: "OESIRadioSelectField",
    classNames,
    styles,
    unstyled,
  })

  const formState = useContext(InterviewFormContext)
  const state = formState?.fields[name]
  if (!formState || !state) {
    return null
  }

  const errorMessage = state.showError ? state.error : undefined

  return (
    <Radio.Group
      label={state.fieldInfo.label || undefined}
      withAsterisk={!state.fieldInfo.optional}
      className={cx(className, classes.root)}
      {...other}
      error={errorMessage}
      value={state.value as string | undefined}
      onChange={(e) => {
        state.handleChange(e)
      }}
      onBlur={() => {
        state.handleTouch()
      }}
      styles={(theme) => ({
        error: {
          paddingTop: theme.spacing.xs,
        },
      })}
    >
      <Stack spacing="sm" {...StackProps}>
        {getOptions(state).map((opt) => (
          <Radio
            className={classes.radio}
            key={opt.value}
            value={opt.value}
            label={opt.label}
          />
        ))}
      </Stack>
    </Radio.Group>
  )
})

RadioSelectField.displayName = "RadioSelectField"

const checkboxStyles = createStyles({
  root: {},
  checkbox: {},
})

export type CheckboxSelectFieldProps = {
  name: string
  StackProps?: Partial<StackProps>
} & DefaultProps<Selectors<typeof checkboxStyles>> &
  Omit<CheckboxGroupProps, "children" | "value" | "onChange" | "onBlur">

/**
 * A checkbox group select component.
 */
export const CheckboxSelectField = observer(
  (props: CheckboxSelectFieldProps) => {
    const {
      name,
      className,
      classNames,
      styles,
      unstyled,
      StackProps,
      ...other
    } = useComponentDefaultProps("OESICheckboxSelectField", {}, props)

    const { classes, cx } = checkboxStyles(undefined, {
      name: "OESICheckboxSelectField",
      classNames,
      styles,
      unstyled,
    })

    const formState = useContext(InterviewFormContext)
    const state = formState?.fields[name]
    if (!formState || !state) {
      return null
    }

    const errorMessage = state.showError ? state.error : undefined

    return (
      <Checkbox.Group
        label={state.fieldInfo.label || undefined}
        withAsterisk={!state.fieldInfo.optional}
        className={cx(className, classes.root)}
        {...other}
        error={errorMessage}
        value={(state.value ?? []) as string[]}
        onChange={(e) => {
          state.handleChange(e)
        }}
        onBlur={() => {
          state.handleTouch()
        }}
        styles={(theme) => ({
          error: {
            paddingTop: theme.spacing.xs,
          },
        })}
      >
        <Stack spacing="sm" {...StackProps}>
          {getOptions(state).map((opt) => (
            <Checkbox
              className={classes.checkbox}
              key={opt.value}
              value={opt.value}
              label={opt.label}
            />
          ))}
        </Stack>
      </Checkbox.Group>
    )
  }
)

CheckboxSelectField.displayName = "CheckboxSelectField"

/**
 * Get the option labels from the json schema.
 */
const getOptions = (state: FieldState) => {
  const fieldInfo = state.fieldInfo as { options: string[] }
  return fieldInfo.options.map((opt, i) => ({ value: `${i}`, label: opt }))
}
