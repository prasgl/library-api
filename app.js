const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
// const jwtDecode = require('jwt-decode'); // TODO - auth
const morgan = require('morgan');
// const passport = require('passport'); // TODO - auth
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');
const appConfig = require('./config/app/config.json');

const Logger = require('./config/logger');
const index = require('./utils/index');

const membersRoutes = require('./routes/members');
const booksRoutes = require('./routes/books');
const issueRoutes = require('./routes/issue');

const logger = new Logger('app');
const app = express();
const port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

logger.info(`NODE JS RUNNING ON ${process.version}`);
logger.info(`PORT = ${port}`);
logger.info(`process.env.NODE_ENV = ${process.env.NODE_ENV}`);
// logger.info(`process.env.AUTH_STRATEGY = ${process.env.AUTH_STRATEGY}`); // TODO - auth

process.on('warning', (warning) => {
    logger.warn('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    logger.warn(`Warning name: ${warning.name}`);
    logger.warn(`Warning message: ${warning.message}`);
    logger.warn(`Stack trace: ${warning.stack}`);
    logger.warn('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
});

process.on('unhandledRejection', (reason, p) => {
    logger.warn('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    logger.warn(`Unhandled Rejection at promise: ${JSON.stringify(p)} reason: ${reason}`);
    logger.warn(`stack trace: ${reason.stack}`)
    logger.warn('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
});

process.on('uncaughtException', (err) => {
    logger.warn('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    logger.warn(`Uncaught exception = ${err}`);
    logger.warn(`Uncaught stack = ${err.stack}`);
    logger.warn('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
});

const onStartUp = async (err) => {
    if (err) {
        logger.error(`Error starting server: ${err}`);
    }
    try {
        await index.setupMongo(); // TODO - mongodb
    } catch (error) {
        const errMsg = `Failed to setup Mongo: ${error}`;
        logger.error(errMsg);
    }
    logger.info(`Server running on port ${port}`);
};

app.use(cors());
app.use(morgan('dev'));
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(bodyParser.json());
// app.use(passport.initialize()); // TODO - auth


// routes which should handle requests
app.use('/members', membersRoutes);
app.use('/books', booksRoutes);
app.use('/issue', issueRoutes);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

app.use((req, res, next) => {
    const error = new Error('No route found');
    error.status = 404;
    next(error);
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});

app.listen(port, onStartUp);

module.exports = app;
