"""The update view."""
from __future__ import annotations

from builtins import bool
from dataclasses import dataclass
from typing import Any, Optional

from attrs import frozen
from blacksheep import FromJSON, HTTPException, Request
from blacksheep.messages import get_absolute_url_to_path
from blacksheep.server.openapi.common import (
    ContentInfo,
    RequestBodyInfo,
    ResponseExample,
    ResponseInfo,
)
from cattrs import BaseValidationError
from oes.interview.config.interview import InterviewConfig
from oes.interview.process import advance_interview_state
from oes.interview.response import create_state_response
from oes.interview.serialization import converter
from oes.interview.server.app import app, docs
from oes.interview.server.settings import Settings
from oes.interview.state import InterviewState, InvalidStateError


@frozen
class InterviewStateRequest:
    state: str
    responses: Optional[dict[str, Any]] = None
    button: Optional[int] = None

    def get_validated_state(self, *, key: bytes) -> InterviewState:
        verified = InterviewState.decrypt(self.state, key=key)
        verified.validate()
        return verified

    @classmethod
    def parse(cls, data: dict[str, Any]) -> InterviewStateRequest:
        request_body = converter.structure(data, InterviewStateRequest)
        return request_body


@dataclass
class ExampleInterviewStateResponse:
    state: str
    update_url: str
    content: dict
    target_url: str
    complete: bool


_example = {
    "state": "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==",
    "update_url": "http://localhost:8000/update",
    "content": {
        "type": "question",
        "title": "Question",
        "description": "Please provide the following information",
        "fields": [
            {
                "type": "text",
                "optional": False,
                "default": None,
                "label": "Name",
            }
        ],
    },
}

_completed_example = {
    "state": "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==",
    "target_url": "http://localhost:8080/some/endpoint",
    "complete": True,
}

_request_example = {
    "state": "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==",
    "responses": {
        "field_0": "John Example",
    },
    "button": 0,
}


@docs(
    request_body=RequestBodyInfo(
        examples={
            "update": _request_example,
        }
    ),
    responses={
        200: ResponseInfo(
            "An InterviewStateResponse.",
            content=[
                ContentInfo(
                    ExampleInterviewStateResponse,
                    examples=[
                        ResponseExample(_example, summary="Ask result"),
                        ResponseExample(
                            _completed_example, summary="Completed interview state"
                        ),
                    ],
                ),
            ],
        ),
        409: ResponseInfo("The state is expired."),
        422: ResponseInfo("The submitted values are invalid."),
    },
)
@app.router.post(
    "/update",
)
async def update_interview_state(
    request: Request,
    body: FromJSON[dict[str, Any]],
    interview_config: InterviewConfig,
    settings: Settings,
):
    """Update an interview state.

    Validates the state, applies the responses, and returns a new state and content.
    """

    try:
        update_request = InterviewStateRequest.parse(body.value)
    except BaseValidationError:
        raise HTTPException(422, "Invalid request")

    try:
        state = update_request.get_validated_state(
            key=settings.encryption_key.get_secret_value()
        )
    except BaseValidationError:
        raise HTTPException(422, "Invalid request")
    except InvalidStateError:
        raise HTTPException(409, "Invalid or expired state")

    # Check that the interview exists
    interview = interview_config.get_interview(state.interview_id)
    if not interview:
        raise HTTPException(422, "Interview not found")

    try:
        state, result = advance_interview_state(
            state,
            interview.question_bank,
            update_request.responses,
            update_request.button,
        )
    except BaseValidationError:
        raise HTTPException(422, "Invalid response values")

    update_url = get_absolute_url_to_path(request, "/update")

    response = create_state_response(
        state,
        key=settings.encryption_key.get_secret_value(),
        content=result,
        update_url=update_url.value.decode(),
    )

    return converter.unstructure(response)
