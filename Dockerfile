FROM node:20-alpine AS runtime

WORKDIR /app
COPY . /app

RUN ls -la /app
RUN npm install

ENV NODE_ENV=production
EXPOSE 5001

CMD ["npm", "start"]