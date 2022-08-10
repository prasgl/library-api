const { v4: uuidv4 } = require('uuid');

const constants = require('../helpers/constants');
const Logger = require('../config/logger');

const logger = new Logger('request-logger');

// eslint-disable-next-line no-unused-vars
const logRequestInfo = (req, res, next) => {
    // add a transactionID header to every incoming request so we can track it in the logs
    const transactionID = uuidv4();
    req.headers[constants.REQUEST_HEADERS.TRANSACTION_ID] = transactionID;

    logger.debug(`Incoming request: ${req.method} ${req.originalUrl}`, transactionID);
    logger.debug(`Request headers: ${JSON.stringify(req.headers, null, 4)}`, transactionID);
    logger.debug(`Request body: ${JSON.stringify(req.body, null, 4)}`, transactionID);

    return next();
};

module.exports = logRequestInfo;
