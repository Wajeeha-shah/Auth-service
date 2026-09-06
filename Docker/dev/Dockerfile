FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Husky hooks are only needed in a local Git checkout.
ENV HUSKY=0
RUN npm install

COPY . .

EXPOSE 3000

# Generate keys at startup (after volume mounts are applied), then start dev server.
# generateKeys.ts has a guard — won't overwrite if keys already exist.
CMD ["sh", "-c", "npm run generate:keys && npm run dev"]
