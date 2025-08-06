FROM node:22-alpine

RUN apk add --no-cache git curl

COPY scaffolding/common/ app/
COPY scaffolding/ts-react-vite-tailwind/ app/

WORKDIR /app

RUN npm install

EXPOSE 8080

CMD ["npm", "run", "dev"]

