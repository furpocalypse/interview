from oes.interview.config.step import (
    Ask,
    Block,
    Eval,
    Exit,
    Set,
    StepOrBlock,
    flatten_steps,
)
from oes.interview.serialization import converter


def test_step_parse():
    step_list = [
        {"ask": "test"},
        {"set": "test", "value": "123"},
        {"block": [{"ask": "test2"}]},
        {"exit": "Exit", "message": "Exit message"},
        {"eval": [1, "2", "1 + 2"]},
    ]

    steps = converter.structure(step_list, list[StepOrBlock])
    assert isinstance(steps[0], Ask)
    assert isinstance(steps[1], Set)
    assert isinstance(steps[2], Block)
    assert isinstance(steps[3], Exit)
    assert isinstance(steps[4], Eval)


def test_flatten_blocks():
    step_list = [{"block": [{"block": [{"ask": "test"}]}]}]

    steps = converter.structure(step_list, list[StepOrBlock])
    flattened = flatten_steps(steps)
    assert len(flattened) == 1
    assert isinstance(flattened[0], Ask)


def test_flatten_blocks_when():
    step_list = [
        {
            "block": [{"block": [{"ask": "test", "when": "false"}], "when": "true"}],
            "when": [True],
        }
    ]

    steps = converter.structure(step_list, list[StepOrBlock])
    flattened = flatten_steps(steps)
    assert not flattened[0].when_matches()


def test_flatten_blocks_when_2():
    step_list = [{"block": [{"block": [{"ask": "test"}], "when": "true"}]}]

    steps = converter.structure(step_list, list[StepOrBlock])
    flattened = flatten_steps(steps)
    assert flattened[0].when_matches()
