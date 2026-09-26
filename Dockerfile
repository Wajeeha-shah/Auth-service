FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
ENV HUSKY=0
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
ENV HUSKY=0
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist ./dist
RUN mkdir -p /app/certs && chown -R node:node /app

USER node
EXPOSE 3000

CMD ["npm", "start"]
