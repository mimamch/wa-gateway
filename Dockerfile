# FROM node:18.16 
FROM node:22.14-alpine 

WORKDIR /app

# Instal dependency yang dibutuhkan sebelum npm install
RUN apk add --no-cache git

COPY package*.json ./
COPY .env.sample ./.env

RUN npm install
COPY . ./
RUN echo "Lihat direktori"
RUN pwd
# RUN cp .env.sample .env

EXPOSE 8180
CMD [ "npm", "run", "start" ]