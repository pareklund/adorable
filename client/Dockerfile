FROM node:22-alpine

RUN apk add --no-cache git curl

COPY client/adorable-chat-connect/ app/

WORKDIR /app

RUN npm install

EXPOSE 8080

CMD ["npm", "run", "dev"]
