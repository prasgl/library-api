const jwtAuth = require('./jwt-auth');
const appIDAuth = require('./app-id-auth');
const constants = require('../helpers/constants');

const getAuthStrategy = (role) => {
    if (process.env.AUTH_STRATEGY === 'DEVELOPMENT') {
        return jwtAuth;
    }
};

module.exports = {
    getAuthStrategy,
};
