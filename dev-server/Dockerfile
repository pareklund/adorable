FROM node:22-alpine

RUN apk add --no-cache git curl

COPY scaffolding/common/ workspaces/scaffolding
COPY scaffolding/ts-react-vite-tailwind/ workspaces/scaffolding

COPY scaffolding/common/ workspaces/current
COPY scaffolding/ts-react-vite-tailwind/ workspaces/current

WORKDIR /workspaces/current

# RUN npm install

EXPOSE 8080

ADD dev-server/start.sh /
RUN chmod +x /start.sh

CMD ["/start.sh"]

# CMD ["npm", "run", "dev"]

