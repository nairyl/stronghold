FROM node:14.16.0 as build
ENV PATH="/root/.cargo/bin:${PATH}"

COPY ./ ./

RUN \
    apt-get update && \
    apt-get install jq rsync -y && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh -s -- -y && \
    ./stronghold-cli/scripts/build.sh

FROM node:14.16.0-slim
EXPOSE 8020:8020
EXPOSE 9033:9033
VOLUME /root/.stronghold
ENV NODE_ENV production

RUN apt-get update && apt-get install curl -y

WORKDIR /usr/src
COPY --from=build /stronghold-cli/build.cli/stronghold-cli ./app
COPY --from=build /stronghold-cli/scripts/entrypoint.sh ./app/
RUN chmod +x ./app/entrypoint.sh

# TODO: use environment variables for this
WORKDIR /usr/src/app
ENTRYPOINT ["./entrypoint.sh"]
CMD ["start", "--rpc.ipc", "--rpc.tcp"]
