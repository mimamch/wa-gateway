FROM node:22.14.0

WORKDIR /app

# Update the package list and install prerequisites
RUN apt-get update

# install dependencies and start the app
CMD ["sh", "-c", "npm install && npm start"]