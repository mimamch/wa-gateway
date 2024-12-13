FROM node:22


# Update the package list and install prerequisites
RUN apt-get update

# Set working directory
WORKDIR /app

CMD ["sh", "-c", "npm install && npm start"]
