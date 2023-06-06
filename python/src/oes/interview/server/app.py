"""Server application."""
from blacksheep import Application
from blacksheep.server.openapi.v3 import OpenAPIHandler
from oes.interview.config.interview import (
    InterviewConfig,
    interviews_context,
    load_interview_config,
)
from oes.interview.server.settings import load_settings
from openapidocs.v3 import Info

app = Application()

docs = OpenAPIHandler(info=Info(title="OES Interview Service", version="0.1"))
docs.bind_app(app)

app.use_cors(allow_origins="*")


@app.on_start
async def on_start(app: Application):
    settings = load_settings()
    app.services.add_instance(settings)

    interviews = load_interview_config(settings.config_file)
    app.services.add_instance(interviews)


async def context_middleware(request, handler):
    interviews = app.service_provider[InterviewConfig]
    token = interviews_context.set(interviews)
    try:
        return await handler(request)
    finally:
        interviews_context.reset(token)


app.middlewares.append(context_middleware)
