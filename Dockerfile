FROM mhart/alpine-node:latest AS builder
WORKDIR /src

COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build

FROM mhart/alpine-node
RUN yarn global add serve
WORKDIR /src
COPY --from=builder /src/build .

EXPOSE 3000
CMD ["serve", "-p", "80", "-s", "."]
