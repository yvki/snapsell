# Project Background
One of my modules for Year 1 is **Back-end Web Development (aka BED)** where I had to **develop a full-stack web app from scratch over 4 months** based on a given problem statement...

## Problem Statement

At the start of a poly semester, you would buy books for modules you are taking and at the end of the semester discard them. You thought it was extremely wasteful to toss away perfectly good books. You found a mobile developer who relates to the same pain and he hands you the following **API specs** for Snapsell the next day. 

### Supposedly you are an expert backend developer...

- Create a **new MySQL database** with the **necessary tables with correct use of primary and foreign key constraints**

- Create an **Express server that consume data from MySQL using the MySQL library**.

- Create an endpoint 

  - to upload images of **jpg extension and file size below 1 MB**.
  
  - to **view own listed products**
  
  -	to **view offers from other users**
  
  -	to **add a product listing**  
  
  -	to **search for a specific product**
  
  -	to **make offer for own product**
  
- Create a front-end using an **open-source framework** with **persistent login and logout**

## Installation 

1. Download the zipped files and open them in `Visual Studio Code`.

2. Run `npm init` to create new `package.json` files, `npm install` to update and create `node_modules` folder. 

3. Run `npm install --save axios`, `npm install --save bcrypt@3.2.0`, `npm install --save cors`, `npm install --save dotenv`, `npm install --save jsonwebtoken` to install the `axios`, `bcrypt`, `cors`, `dotenv` and `jsonwebtoken` packages respectively. 
    
4. In VS Code's terminal, type `npm run start-dev` and `nodemon index.js` to run the **back-end** and **front-end** scripts respectively.

## Backend Set-up

1. Open **MySQLWorkbench** and click on the **Local instance MYSQL80 connection**. 

2. Once prompted, enter the password set previously before clicking on **OK**. 

3. Create a schema called `bookstore` and **double click** to make it the working database.

4. Open **Postman** to **insert, update, delete or view the JSON outputs according to the endpoints**.

## Frontend Set-up

1. Enter `localhost:3001/` in the browser to display the **index page of SNAPSELL**.

2. The URL of the other pages are indicated under `CA2 > front-end > index.js`. 
