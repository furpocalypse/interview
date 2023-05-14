from pathlib import Path

import pytest
from cattrs import BaseValidationError
from oes.interview.config.interview import Interview
from oes.interview.serialization import converter


def test_parse_questions():
    obj = {
        "id": "test",
        "title": "Test Interview",
        "questions": [Path("tests/data/questions.yml")],
        "steps": [{"ask": "test1"}],
    }

    interview = converter.structure(obj, Interview)
    assert interview.question_bank.get_question("test1") is not None
    assert interview.question_bank.get_question("test_not_found") is None


def test_parse_no_file():
    obj = {
        "id": "test",
        "title": "Test Interview",
        "questions": [Path("tests/data/not_found.yml")],
        "steps": [],
    }

    with pytest.raises(BaseValidationError):
        converter.structure(obj, Interview)


def test_parse_questions_missing():
    obj = {
        "id": "test",
        "title": "Test Interview",
        "questions": [Path("tests/data/questions.yml")],
        "steps": [{"ask": "test_not_found"}],
    }

    with pytest.raises(BaseValidationError):
        converter.structure(obj, Interview)
