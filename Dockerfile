FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

# The command to start the development server
CMD ["npm", "run", "dev"]

