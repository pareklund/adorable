FROM node:22-alpine

RUN apk add --no-cache git curl

RUN git clone https://github.com/pareklund/adorable-template.git app

WORKDIR /app

RUN npm install

EXPOSE 8080

CMD ["npm", "run", "dev"]

