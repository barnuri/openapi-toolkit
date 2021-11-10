FROM node 
 
RUN mkdir -p /app/
WORKDIR /app/
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

CMD [ "bash" ]
