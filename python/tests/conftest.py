import pytest
from oes.interview.parsing.template import default_jinja2_env
from oes.template import jinja2_env_context


@pytest.fixture(autouse=True)
def setup_jinja2_env():
    token = jinja2_env_context.set(default_jinja2_env)
    yield
    jinja2_env_context.reset(token)
