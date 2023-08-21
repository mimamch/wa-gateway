FROM node:20.5-alpine3.18
ENV NODE_ENV=production

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

RUN echo "PORT=5001\nKEY=XXXtestXXX" >> .env

CMD [ "npm", "run", "start" ]

EXPOSE 5001