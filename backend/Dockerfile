FROM node:22-alpine

RUN apk add --no-cache git curl

COPY backend/adorable-backend/ app/

COPY scaffolding/common/ workspace/
COPY scaffolding/ts-react-vite-tailwind/ workspace/

WORKDIR /app

RUN npm install

EXPOSE 8080

CMD ["npm", "run", "dev"]

