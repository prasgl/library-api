const log4js = require('log4js');
const config = require('./index');

log4js.configure({
    appenders: {
        out: { type: 'console' },
    },
    categories: {
        default: { appenders: ['out'], level: config.log.level },
    },
});

// wrapper class for log4js logger
// logs transactionID with messages for traceability
const Logger = class {
    constructor(moduleName) {
        this.logger = log4js.getLogger(moduleName);
        this.logger.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : config.log.level;
    }

    // eslint-disable-next-line class-methods-use-this
    formatMessage(message, txID) {
        if (txID) return `"x-${process.env.APP_NAME}-txn-id:${txID}" ${message}`;
        return message;
    }

    debug(message, txID) {
        const logMessage = this.formatMessage(message, txID);
        this.logger.debug(logMessage);
    }

    info(message, txID) {
        const logMessage = this.formatMessage(message, txID);
        this.logger.info(logMessage);
    }

    warn(message, txID) {
        const logMessage = this.formatMessage(message, txID);
        this.logger.warn(logMessage);
    }

    error(message, txID) {
        const logMessage = this.formatMessage(message, txID);
        this.logger.error(logMessage);
    }
};

module.exports = Logger;
