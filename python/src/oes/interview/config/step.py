"""Step module."""
from __future__ import annotations

import copy
from abc import ABC, abstractmethod
from collections.abc import Iterable, Sequence
from enum import Enum
from typing import TYPE_CHECKING, Any, Optional, Union

from attrs import evolve, field, frozen
from cattrs import Converter
from oes.interview.config.question import Question
from oes.interview.config.question_bank import question_bank_context
from oes.interview.parsing.location import Location, UndefinedError
from oes.interview.parsing.types import Whenable, validate_identifier
from oes.interview.parsing.undefined import Undefined
from oes.interview.response import AskResult, ExitResult
from oes.template import Condition, Evaluable, Expression, LogicAnd, Template

if TYPE_CHECKING:
    from oes.interview.state import InterviewState

Value = Union[None, str, int, float, bool, dict, list, tuple]
"""Value literal types."""

ValueTypes = (str, int, float, bool, dict, list, tuple)

ValueOrExpression = Union[Value, Expression]
"""A literal value type, or a template expression."""


class StepResultStatus(Enum):
    not_changed = "skipped"
    """The step did not cause a change."""

    changed = "changed"
    """The step resulted in the state being changed."""

    completed = "completed"
    """The interview is complete."""


StepResult = Union[AskResult, ExitResult, StepResultStatus]
"""The result of handling a :class:`Step`."""


class AbstractStep(Whenable, ABC):
    """Step base class."""

    @abstractmethod
    def handle(self, state: InterviewState) -> tuple[InterviewState, StepResult]:
        """Handle this step, returning the updated state and a result."""
        ...


@frozen
class Block(Whenable):
    """A block of steps."""

    block: list[StepOrBlock]
    when: Condition = ()


@frozen
class Set(AbstractStep):
    """Set a value."""

    set: Location
    value: ValueOrExpression
    always: bool = False
    """Whether to always set the value, or only if undefined."""

    when: Condition = ()

    def _check_defined(self, context: dict[str, Any]):
        try:
            self.set.evaluate(**context)
            return True
        except UndefinedError:
            return False

    def handle(self, state: InterviewState) -> tuple[InterviewState, StepResult]:
        if self._check_defined(state.template_context) and not self.always:
            return state, StepResultStatus.not_changed  # skip if already defined

        if isinstance(self.value, Evaluable):
            value = self.value.evaluate(**state.template_context)
        else:
            value = self.value

        new_data = copy.deepcopy(state.data)
        self.set.set(value, new_data)
        state = evolve(state, data=new_data)
        return state, StepResultStatus.changed


@frozen
class Ask(AbstractStep):
    """Ask a question."""

    ask: str = field(validator=[validate_identifier])
    when: Condition = ()

    @property
    def question(self) -> Question:
        bank = question_bank_context.get()
        if bank is None:
            raise RuntimeError("Question bank not available")

        question = bank.get_question(self.ask)

        if question is None:
            raise ValueError(f"Question ID not found: {self.ask!r}")

        return question

    def handle(self, state: InterviewState) -> tuple[InterviewState, StepResult]:
        if self.ask in state.answered_question_ids:
            return state, StepResultStatus.not_changed
        else:
            response = AskResult.create_from_step(self, state)
            state = state.update_with_question(self.ask)
            return state, response


@frozen
class Exit(AbstractStep):
    """Exit an interview."""

    exit: Template
    description: Optional[Template] = None
    when: Condition = ()

    def handle(self, state: InterviewState) -> tuple[InterviewState, StepResult]:
        return state, ExitResult.create_from_step(self, state)


@frozen
class Eval(AbstractStep):
    """Evaluate values."""

    eval: Union[ValueOrExpression, Sequence[ValueOrExpression]]
    when: Condition = ()

    def handle(self, state: InterviewState) -> tuple[InterviewState, StepResult]:
        as_list = self.eval if isinstance(self.eval, (list, tuple)) else [self.eval]

        for val in as_list:
            if isinstance(val, Evaluable):
                res = val.evaluate(**state.template_context)
                if isinstance(res, Undefined):
                    res._fail_with_undefined_error()

        return state, StepResultStatus.not_changed


Step = Union[Set, Ask, Exit, Eval]
StepOrBlock = Union[Step, Block]


def _get_step_type(value: dict):
    if "block" in value:
        return Block
    elif "set" in value:
        return Set
    elif "ask" in value:
        return Ask
    elif "exit" in value:
        return Exit
    elif "eval" in value:
        return Eval
    else:
        raise TypeError(f"Invalid type: {value}")


def parse_step(converter: Converter, value: object) -> StepOrBlock:
    if not isinstance(value, dict):
        raise TypeError(f"Invalid type: {value}")

    cls = _get_step_type(value)
    return converter.structure(value, cls)


def parse_value(v):
    if v is None or isinstance(v, ValueTypes):
        return v
    else:
        raise TypeError(f"Invalid type {v}")


def _get_when(obj: Whenable) -> Evaluable:
    if isinstance(obj.when, tuple):
        conds = obj.when
    else:
        conds = (obj.when,) if obj.when else ()

    return LogicAnd(and_=conds)


def flatten_block(step: Block) -> list[StepOrBlock]:
    """Flatten a :class:`Block` step into a list of its inner steps.

    Combines the ``when`` conditions.
    """
    steps = []
    block_when = _get_when(step)
    for inner_step in step.block:
        step_when = _get_when(inner_step)
        new_inner_step = evolve(inner_step, when=(block_when, step_when))
        steps.append(new_inner_step)

    return steps


def flatten_steps(steps: Iterable[StepOrBlock]) -> list[Step]:
    """Recursively flatten :class:`Block` steps."""
    final_steps = []
    for step in steps:
        if isinstance(step, Block):
            flattened_block = flatten_block(step)
            flattened_steps = flatten_steps(flattened_block)
            final_steps.extend(flattened_steps)
        else:
            final_steps.append(step)

    return final_steps
