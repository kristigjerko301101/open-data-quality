# Use an official Node.js runtime as the base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the React app for production
RUN npm run build

# Serve the built app using a simple web server
RUN npm install -g serve

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to start the web server
CMD ["serve", "-s", "build", "-l", "3000"]
