FROM rakudo-star:latest

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libssl-dev libpq-dev \
    && rm -rf /var/lib/apt/lists/*
RUN zef install --/test Cro::HTTP Cro::WebSocket JSON::Fast Red

WORKDIR /app
COPY lib/ lib/
COPY js/ js/
COPY index.html server.raku ./

EXPOSE 3001

CMD ["raku", "server.raku"]
