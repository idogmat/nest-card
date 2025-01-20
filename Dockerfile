# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN yarn

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 3003

# Command to run the application
CMD ["yarn", "start:dev"]
