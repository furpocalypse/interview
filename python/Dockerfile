FROM pypy:3.9-7.3.11-slim AS base

FROM base AS build

RUN apt-get update \
    && apt-get install -y build-essential \
    && apt-get clean

WORKDIR /app
RUN pip install --no-cache --upgrade poetry
COPY pyproject.toml poetry.lock ./
RUN poetry export -E server -o requirements.txt \
    && python -m venv ./venv \
    && ./venv/bin/pip install --no-cache-dir wheel \
    && ./venv/bin/pip install --no-cache-dir -r requirements.txt
COPY README.md ./
COPY src/ src/
RUN poetry build \
    && ./venv/bin/pip install --no-cache-dir ./dist/*.whl

FROM base AS target

RUN useradd --no-create-home -d /app -r -U app
RUN mkdir /config
COPY --from=build /app/venv/ /app/venv/
WORKDIR /app
USER app
ENV CONFIG_FILE=/config/interviews.yml
ENTRYPOINT [ "/app/venv/bin/uvicorn", "oes.interview.server.app:app" ]
CMD [ "--host", "0.0.0.0" ]
