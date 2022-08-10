const Logger = require('../config/logger');

const logger = new Logger('index');

async function setupMongo() {
    // TODO - set up mongodb
}

module.exports = {
    setupMongo
};
