exports.REQUEST_HEADERS = {
    TRANSACTION_ID: `x-${process.env.APP_NAME}-txn-id`,
};

exports.ERROR_CODES = {
    TIMEOUT: 'ECONNABORTED'
}