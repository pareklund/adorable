FROM node:22-alpine

RUN apk add --no-cache git curl

COPY backend/adorable-backend/ app/

COPY scaffolding/common/ workspaces/scaffolding
COPY scaffolding/ts-react-vite-tailwind/ workspaces/scaffolding

RUN ln -s /workspaces/scaffolding /workspaces/current

WORKDIR /app

RUN npm install

EXPOSE 8080

CMD ["npm", "run", "dev"]

