import {
  Button,
  ButtonProps,
  createStyles,
  DefaultProps,
  Grid,
  GridProps,
  Selectors,
  Stack,
  StackProps,
  useComponentDefaultProps,
} from "@mantine/core"
import { ExitResult } from "@oes/interview-lib"
import { Markdown } from "#src/components/Markdown.js"

const exitStyles = createStyles({
  root: {},
  markdown: {
    flex: "auto",
  },
  button: {},
})

export type ExitViewProps = {
  /**
   * The {@link ExitResult}.
   */
  content: ExitResult

  /**
   * Handler to call when the close/exit button is clicked.
   */
  onClose?: () => void

  /**
   * Props passed to the Stack component.
   */
  stackProps?: Partial<StackProps>

  /**
   * Props passed to the Grid component.
   */
  gridProps?: Partial<GridProps>

  /**
   * Props passed to the close/exit button.
   */
  buttonProps?: Partial<ButtonProps>
} & DefaultProps<Selectors<typeof exitStyles>>

/**
 * Display the content for a {@link ExitResult}.
 */
export const ExitView = (props: ExitViewProps) => {
  const {
    styles,
    unstyled,
    className,
    classNames,
    content,
    onClose,
    stackProps,
    gridProps,
    buttonProps,
    ...other
  } = useComponentDefaultProps("OESIExitView", {}, props)

  const { classes, cx } = exitStyles(undefined, {
    name: "OESIExitView",
    styles,
    unstyled,
    classNames,
  })

  return (
    <Stack className={cx(classes.root, className)} {...stackProps} {...other}>
      <Markdown className={classes.markdown}>
        {content.description || ""}
      </Markdown>
      <Grid justify="flex-end" {...gridProps}>
        <Grid.Col span="content">
          <Button
            variant="outline"
            className={classes.button}
            {...buttonProps}
            onClick={() => onClose && onClose()}
          >
            Close
          </Button>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
