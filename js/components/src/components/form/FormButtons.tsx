import {
  Button,
  ButtonProps,
  createStyles,
  DefaultProps,
  Grid,
  GridProps,
  Selectors,
  useComponentDefaultProps,
} from "@mantine/core"
import { Button as IButton } from "@oes/interview-lib"
import { observer } from "mobx-react-lite"
import { useContext } from "react"
import { InterviewFormContext } from "#src/components/form/Form.js"

const buttonStyles = createStyles({
  root: {},
  primary: {},
  default: {},
})

export type FormButtonProps = {
  /**
   * The button ID.
   */
  buttonId: number

  /**
   * The button text.
   */
  label: string

  /**
   * Whether the button should be rendered as the primary option.
   */
  primary?: boolean

  /**
   * Whether this button should represent the default submit action.
   */
  default?: boolean
} & DefaultProps<Selectors<typeof buttonStyles>> &
  Omit<ButtonProps, "children">

/**
 * A button in an interview question form.
 */
export const FormButton = observer((props: FormButtonProps) => {
  const {
    styles,
    unstyled,
    className,
    classNames,
    buttonId,
    label,
    primary,
    default: _default,
    ...other
  } = useComponentDefaultProps("OESIFormButton", {}, props)

  const { classes, cx } = buttonStyles(undefined, {
    name: "OESIFormButton",
    classNames,
    styles,
    unstyled,
  })

  const form = useContext(InterviewFormContext)

  return (
    <Button
      className={cx(
        classes.root,
        _default && classes.default,
        primary && classes.primary,
        className
      )}
      variant={primary ? "filled" : "outline"}
      disabled={!!form && form?.submitting}
      {...other}
      type={_default ? "submit" : "button"}
      onClick={(e) => {
        form?.setButton(buttonId)
        const formEl = form?.formEl

        if (!_default) {
          e.preventDefault()

          if (formEl) {
            triggerSubmit(formEl)
          }
        }
      }}
    >
      {label}
    </Button>
  )
})

FormButton.displayName = "FormButton"

// workaround to trigger form's onSubmit
const triggerSubmit = (el: HTMLElement) => {
  const buttonEl = document.createElement("button")
  buttonEl.style.display = "none"
  buttonEl.setAttribute("type", "submit")
  el.appendChild(buttonEl)
  buttonEl.click()
  el.removeChild(buttonEl)
}

const buttonsStyles = createStyles({
  root: {},
})

export type FormButtonsProps = {
  /**
   * The array of buttons.
   */
  buttons?: IButton[]
} & DefaultProps<Selectors<typeof buttonStyles>> &
  Omit<GridProps, "children">

/**
 * Display the button(s) in an interview question form.
 */
export const FormButtons = (props: FormButtonsProps) => {
  const { styles, unstyled, className, classNames, buttons, ...other } =
    useComponentDefaultProps(
      "OESIFormButtons",
      {
        buttons: [
          {
            default: true,
            label: "Next",
            primary: true,
          },
        ],
      },
      props
    )

  const { classes, cx } = buttonsStyles(undefined, {
    name: "OESIFormButtons",
    styles,
    unstyled,
    classNames,
  })

  return (
    <Grid className={cx(classes.root, className)} {...other}>
      {buttons.map((btn, i) => (
        <Grid.Col key={i} xs={12} md="content">
          <FormButton
            buttonId={i}
            label={btn.label}
            primary={btn.primary}
            default={btn.default}
          />
        </Grid.Col>
      ))}
    </Grid>
  )
}
