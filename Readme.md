Backend With Typescript Documnetation : https://blog.logrocket.com/how-to-set-up-node-typescript-express/#create-package-json-file

=> Command : tsc -w 
    This code keeps the track of changes in the ts file to it's corresponding js file line by line.
=> Command : npx tsx 
    This code builds the JS files corresponding to it's TS files only once the command runs.
=> Command : ts-node 
    This code allows you to run ts files on the server .


FROM node:20

WORKDIR /app

COPY package* .
COPY ./prisma/ .

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 4000

# CMD ["node", "dist/index.js"]
CMD ["npx", "nodemon","dist\index.js"]