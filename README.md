# Books Library API

This repo holds sample code for a books library. It manages three entities - books, library members and book issue. The CRUD apis have been provided for these. 

## Running API Locally
Ensure the following environment variables are set. Sample values are given below.

```
APP_NAME=library-api
MONGO_URL=mongodb://localhost:27017
MONGO_DBNAME=library
```

Make sure node v16.14 is installed (`node --version`) and perform the following commands:
```
git clone git@github.com:prasgl/library-api.git
cd library-api
npm install
npm start
```

To verify the API server is running, bring up the swagger (localhost:3000/api-docs) in a browser.

**Note:** The port can be changed from 3000 by setting the PORT environment variable prior to starting the server

## Unit Testing

Use the following command to run unit tests:
```
npm run test-unit
```
