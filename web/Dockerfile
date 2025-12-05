FROM node:18-slim AS builder

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_DISABLE_TURBOPACK=1
RUN npm run build

FROM node:18-slim AS runner

ENV NODE_ENV=production

COPY --from=builder /.next ./.next
COPY --from=builder /package*.json ./
COPY --from=builder /public ./public
COPY --from=builder /node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
