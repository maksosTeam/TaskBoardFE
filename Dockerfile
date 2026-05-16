FROM node:18-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY ./package*.json ./

RUN npm install react-loading && npm install

COPY . .


EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]