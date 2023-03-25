FROM node:18.9.0-alpine3.16

# Copy dependency definitions
#COPY package.json package-lock.json ./
COPY package.json ./

# disabling ssl for npm for Dev or if you are behind proxy
RUN npm set strict-ssl false


## installing and Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm install && npm ci && mkdir /app && mv ./node_modules ./app



# Change directory so that our commands run inside this new directory
WORKDIR /app

# Get all the code needed to run the app

COPY  . /app/


# Expose the port the app runs in
EXPOSE 3001

USER node

# Serve the app
CMD ["npm", "start"]
