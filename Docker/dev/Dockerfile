FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Husky hooks are only needed in a local Git checkout.
ENV HUSKY=0
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
