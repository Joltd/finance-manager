FROM node:22-slim

COPY ./.next ./.next
COPY ./package*.json ./
COPY ./node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
