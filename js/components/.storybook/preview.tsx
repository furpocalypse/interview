import type { Preview } from "@storybook/react"
import React from "react"
import { DEFAULT_THEME, MantineProvider } from "@mantine/core"

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <MantineProvider theme={DEFAULT_THEME} withGlobalStyles withNormalizeCSS>
        <Story />
      </MantineProvider>
    ),
  ],
}

export default preview
