### STAGE 2: Setup ###
FROM node:16-alpine as builder

## channge directory
WORKDIR /app

#COPY api code to app folder
COPY /user/ /app/

RUN npm ci

## expose port for express
EXPOSE 3001

CMD ["node",  "server.js"]