import {
  AskResult,
  ExitResult,
  InterviewStateStore,
} from "@Open-Event-Systems/interview-lib"
import { useState } from "react"
import { InterviewDialog } from "#src/components/interview/InterviewDialog.js"

export default {
  component: InterviewDialog,
}

const askResult: AskResult = {
  type: "question",
  title: "Example Question",
  description: "This is an _example question_.",
  buttons: [{ default: true, primary: true, label: "Let's Get Started" }],
  fields: {
    field_0: {
      type: "text",
      label: "First Name",
      min: 0,
      max: 100,
      autocomplete: "given-name",
    },
    field_1: {
      type: "text",
      label: "Last Name",
      min: 0,
      max: 100,
      autocomplete: "family-name",
    },
    field_2: {
      type: "number",
      label: "Age",
      min: 0,
      max: 100,
      input_mode: "numeric",
      integer: true,
    },
  },
}

const exitResult: ExitResult = {
  type: "exit",
  title: "Ineligible",
  description: "You are not eligible for this survey.",
}

export const Question = () => {
  const [stateStore] = useState(() => {
    const stateStore = new InterviewStateStore()

    stateStore.saveRecord({
      id: "0000",
      fieldValues: {},
      stateResponse: {
        content: askResult,
        state: "0000",
        update_url: "/",
      },
      metadata: {},
    })

    return stateStore
  })
  return (
    <InterviewDialog
      opened
      onSubmit={async () => undefined}
      onClose={() => undefined}
      recordId="0000"
      stateStore={stateStore}
    />
  )
}

export const Exit = () => {
  const [stateStore] = useState(() => {
    const stateStore = new InterviewStateStore()

    stateStore.saveRecord({
      id: "0001",
      fieldValues: {},
      stateResponse: {
        content: exitResult,
        state: "0001",
        update_url: "/",
      },
      metadata: {},
    })

    return stateStore
  })
  return (
    <InterviewDialog
      opened
      onSubmit={async () => undefined}
      onClose={() => undefined}
      recordId="0001"
      stateStore={stateStore}
    />
  )
}
