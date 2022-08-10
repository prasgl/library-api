const utils = require('../helpers/utils');
const Logger = require('../config/logger');
const mongoHelper = require('../helpers/mongodb-helper');
const helper = require('../helpers/books-helper'); 

const logger = new Logger('books-controller');

exports.create = async (req, res) => {
    try {
        // perform basic validations on data
        const { httpStatus, message } = helper.validateInsert(req.body);
        if (httpStatus) {
            return res.status(httpStatus).send(utils.getErrorMessage(message));
        }

        // trim all data and convert text to upper case
        const sanitizedDoc = utils.trim(req.body);

        const dbRes = await mongoHelper.MongoDB.getInstance().create(sanitizedDoc, 'book');

        return res.status(201).send(utils.sendSuccess('book record created', dbRes));
    } catch (err) {
        logger.error(`Error creating book record: ${err}: ${err.stack}`);

        return res.status(500).send(utils.getErrorMessage(`Error creating book record: ${err}`));
    }
}

exports.update = async (req, res) => {
    // perform basic validations on data
    const { httpStatus, message } = helper.validateUpdate(req.body);
    if (httpStatus) {
        return res.status(httpStatus).send(utils.getErrorMessage(message));
    }

    try {
        updateResp = await mongoHelper.MongoDB.getInstance().update(req.body, 'book');

        return res.status(200).send(utils.sendSuccess('book record updated'));
    } catch (err) {
        logger.error(`Error updating book records: ${err}: ${err.stack}`);

        return res.status(500).send(utils.getErrorMessage(`Error updating book records: ${err}`));
    }
}

exports.getById = async (req, res) => {
    if (!req.params.id || !utils.validateObjectId(req.params.id)) 
        return res.status(400).send(utils.getErrorMessage("invalid id"));

    try {
        const dbRes = await mongoHelper.MongoDB.getInstance().read(req.params.id, 'book');

        if (!dbRes) return res.status(404).send(utils.getErrorMessage('no book record found'));

        return res.status(200).send(utils.sendSuccess('book record retrieved', dbRes));
    } catch (err) {
        logger.error(`Error retrieving book record: ${err}: ${err.stack}`);

        return res.status(500).send(utils.getErrorMessage(`Error retrieving book record: ${err}`));
    }
}

exports.getByTitle = async (req, res) => {

    let title;

    if (typeof req.query.title === 'string') {
        title = req.query.title?.trim();
    }
    else return res.status(400).send(utils.getErrorMessage('title must be string'));

    if (!title) return res.status(400).send(utils.getErrorMessage('title must be specified'));

    const criteria = { title: { $eq: title }};

    try {
        const dbRes = await mongoHelper.MongoDB.getInstance().query(criteria, 'book');

        return res.status(200).send(utils.sendSuccess('book records retrieved', dbRes));
    } catch (err) {
        logger.error(`Error retrieving book records: ${err}: ${err.stack}`);

        return res.status(500).send(utils.getErrorMessage(`Error retrieving book records: ${err}`));
    }
}
