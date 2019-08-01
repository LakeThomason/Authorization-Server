# See http://docs.microsoft.com/azure/devops/pipelines/languages/docker for more information
FROM node:10.15-alpine

# Create app directory
WORKDIR /app

# Copy files
COPY . .

# Install app dependencies
RUN npm install

# Make port 80 available to the world outside this container
EXPOSE 80

# Run start when the container launches
CMD ["npm", "start"]
