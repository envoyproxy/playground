FROM mhart/alpine-node AS builder
RUN apk add --no-cache \
	g++ \
	build-base \
	cairo-dev \
	jpeg-dev \
	pango-dev \
	musl-dev \
	giflib-dev \
	pixman-dev \
	pangomm-dev \
	libjpeg-turbo-dev \
	freetype-dev
WORKDIR /app
ADD ui .
RUN pwd && ls -lh
RUN yarn install && yarn run build

FROM python:3.8-slim
COPY --from=builder /app/build /code/build
RUN pip3 install -q aiodocker aiohttp aiohttp_cors pyyaml pytest-asyncio
ADD ./control /code/control
COPY ./services/ /code/build/static/
COPY ./services.yaml /
ENTRYPOINT ["python3", "/code/control/run.py"]
