FROM mhart/alpine-node AS builder
ENV NODE_ENV=production
WORKDIR /app
ADD ui .
RUN yarn install && yarn run build

FROM python:3.8-slim
COPY --from=builder /app/build /code/build
ADD ./playground /code/playground
ADD ./setup.py /code
WORKDIR /code
RUN pip install .
COPY ./services/ /code/build/static/
COPY ./services.yaml /
ENTRYPOINT ["playground"]
