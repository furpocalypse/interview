FROM python:3.9.16-alpine3.18 AS base

FROM base AS build
RUN apk add git build-base
WORKDIR /build
RUN pip install --no-cache-dir poetry wheel
RUN python -m venv /app
COPY pyproject.toml poetry.lock ./
# hack: exclude oes-* dependencies due to git repos not having hashes
RUN poetry export -E server | grep -v ^oes- > requirements.txt
RUN pip wheel --no-cache-dir -w deps -r requirements.txt
RUN /app/bin/pip install --no-cache-dir deps/*
COPY README.md ./
COPY src/ src/
RUN /app/bin/pip install --no-cache-dir .[server]

FROM base AS interview-server
RUN adduser -h /app -H -D python \
    && mkdir /config
COPY --from=build /app/ /app/
WORKDIR /config
USER python
ENTRYPOINT [ "/app/bin/uvicorn", "oes.interview.server.app:app" ]
CMD [ "--host", "0.0.0.0" ]
