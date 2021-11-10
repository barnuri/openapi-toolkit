FROM node 
 
RUN mkdir -p /app
RUN mkdir -p /output
RUN chmod 777 /output
WORKDIR /app/
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build
RUN echo "#!/bin/bash\nnode ./dist/cli-generate.js -o /output \$CLI_PARAMS" > ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]

