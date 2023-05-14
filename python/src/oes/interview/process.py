"""Interview process module."""
import copy
from collections.abc import Iterable
from typing import Any, Optional

from attrs import evolve
from oes.interview.config.question import Question
from oes.interview.config.question_bank import QuestionBank
from oes.interview.config.step import Step, StepResult, StepResultStatus
from oes.interview.parsing.location import Location, UndefinedError
from oes.interview.response import AskResult
from oes.interview.state import InterviewState, InvalidStateError


class InterviewError(RuntimeError):
    """Raised when there is a problem with an interview."""


def get_questions_for_variable(
    state: InterviewState, bank: QuestionBank, location: Location
) -> Iterable[Question]:
    """Get :class:`Question` instances that provide the value of ``location``.

    Args:
        state: The interview state.
        bank: The question bank.
        location: The :class:`Location` to get the desired value.

    Returns:
        An iterable of :class:`Question`.
    """

    yield from bank.get_questions_providing_variable(location, state.template_context)


def get_question_for_variable(
    state: InterviewState, bank: QuestionBank, location: Location
) -> Question:
    """Get a :class:`Question` that provides the value of ``expr``.

    Does not consider questions that have already been answered, or where the ``when``
    conditions do not match.

    Args:
        state: The interview state.
        bank: The question bank.
        location: The variable location.

    Returns:
        A :class:`Question`.

    Raises:
        InterviewError: If a question could not be found.
    """
    for q in get_questions_for_variable(state, bank, location):
        if q.id in state.answered_question_ids:
            continue

        if not q.when_matches(**state.template_context):
            continue

        return q
    else:
        raise InterviewError(f"No question providing {location}")


def recursive_get_ask_for_variable(
    state: InterviewState, bank: QuestionBank, location: Location
) -> tuple[InterviewState, AskResult]:
    """Recursively get a :class:`AskResult` for a variable.

    Args:
        state: The interview state.
        bank: The question bank.
        location: The variable location.

    Returns:
        A :class:`AskResult`.

    Raises:
        InterviewError: If a question could not be found.
    """
    try:
        q = get_question_for_variable(state, bank, location)
        ask = AskResult.create_from_question(q, state)
        state = state.update_with_question(q.id)
        return state, ask
    except UndefinedError as e:
        return recursive_get_ask_for_variable(state, bank, e.location)


def _validate_and_apply_responses(
    state: InterviewState,
    question: Question,
    responses: Optional[dict[str, Any]],
    button: Optional[int],
) -> dict[str, Any]:
    """Validate and apply responses."""
    values = question.parse_response(responses, button)
    new_data = copy.deepcopy(state.data)
    for path, val in values.items():
        path.set(val, new_data)

    return new_data


def _apply_responses(
    state: InterviewState,
    questions: QuestionBank,
    responses: Optional[dict[str, Any]],
    button: Optional[int],
) -> InterviewState:
    # Apply responses if a question was asked
    if state.question_id is not None:
        question = questions.get_question(state.question_id)
        if not question:
            raise InterviewError(f"Question ID not found: {state.question_id!r}")

        # Apply responses
        new_data = _validate_and_apply_responses(state, question, responses, button)

        # Unset question ID
        return evolve(state, data=new_data, question_id=None)
    else:
        return state


def _handle_step_or_resolve_undefined(
    state: InterviewState, questions: QuestionBank, step: Step
) -> tuple[InterviewState, StepResult]:
    # Handle the step, or return an AskResult for a missing value
    try:
        # Evaluate when conditions
        if not step.when_matches(**state.template_context):
            return state, StepResultStatus.not_changed

        return step.handle(state)
    except UndefinedError as e:
        return recursive_get_ask_for_variable(state, questions, e.location)


def _process_steps(
    state: InterviewState, questions: QuestionBank
) -> tuple[InterviewState, StepResult]:
    # Walk through steps
    for step_wrapper in state.interview.flattened_steps:
        state, res = _handle_step_or_resolve_undefined(state, questions, step_wrapper)
        if res is not StepResultStatus.not_changed:
            return state, res

    state = evolve(state, complete=True)
    return state, StepResultStatus.completed


def advance_interview_state(
    state: InterviewState,
    questions: QuestionBank,
    responses: Optional[dict[str, Any]] = None,
    button: Optional[int] = None,
) -> tuple[InterviewState, StepResult]:
    """Advance the interview state.

    Args:
        state: The interview state.
        questions: The question bank.
        responses: The question responses, if provided.
        button: The button ID, if provided.

    Returns:
        A tuple of the updated state and the step result.
    """
    # Checks
    if state.complete:
        raise InvalidStateError("Interview is already complete")

    state = _apply_responses(state, questions, responses, button)

    # process all steps in order. repeat every time a change is made.
    result: StepResult = StepResultStatus.changed
    while result is StepResultStatus.changed:
        state, result = _process_steps(state, questions)

    return state, result
