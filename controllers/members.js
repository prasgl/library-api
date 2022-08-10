const utils = require('../helpers/utils');
const Logger = require('../config/logger');
const mongoHelper = require('../helpers/mongodb-helper');
const helper = require('../helpers/members-helper'); 

const logger = new Logger('members-controller');

exports.create = async (req, res) => {
    try {
        // perform basic validations on data
        const { httpStatus, message } = helper.validateInsert(req.body);
        if (httpStatus) {
            return res.status(httpStatus).send(utils.getErrorMessage(message));
        }

        // trim all data and convert text to upper case
        const sanitizedDoc = utils.trim(req.body);

        // remove all spaces and hyphens from mobile number
        sanitizedDoc.mobile = sanitizedDoc.mobile.replaceAll(/[-\s]/g, '');

        const dbRes = await mongoHelper.MongoDB.getInstance().create(sanitizedDoc, 'member');

        return res.status(201).send(utils.sendSuccess('member record created', dbRes));
    } catch (err) {
        logger.error(`Error creating member record: ${err}: ${err.stack}`);

        return res.status(500).send(utils.getErrorMessage(`Error creating member record: ${err}`));
    }
}

exports.getById = async (req, res) => {

    if (!req.params.id) return res.status(400).send(utils.getErrorMessage("member id must be specified"));

    if (!utils.validateObjectId(req.params.id)) return res.status(400).send(utils.getErrorMessage("invalid id"));

    try {
        const dbRes = await mongoHelper.MongoDB.getInstance().read(req.params.id, 'member');

        if (!dbRes) return res.status(404).send(utils.getErrorMessage('no member record found'));

        return res.status(200).send(utils.sendSuccess('member record retrieved', dbRes));
    } catch (err) {
        logger.error(`Error retrieving member record: ${err}: ${err.stack}`);

        return res.status(500).send(utils.getErrorMessage(`Error retrieving member record: ${err}`));
    }
}

exports.getByName = async (req, res) => {

    ({firstName, lastName} = req.query);

    if ((!firstName || typeof firstName === 'string') && (!lastName || typeof lastName === 'string')) {
        firstName = firstName?.trim();
        lastName = lastName?.trim();
    }
    else return res.status(400).send(utils.getErrorMessage('first name and last name must be string'));

    if (!firstName && !lastName) return res.status(400).send(utils.getErrorMessage('first name and/or last name must be specified'));

    const criteria = {};
    if (firstName) criteria.firstName = { $eq: firstName };
    if (lastName) criteria.lastName = { $eq: lastName };

    try {
        const dbRes = await mongoHelper.MongoDB.getInstance().query(criteria, 'member');

        return res.status(200).send(utils.sendSuccess('member records retrieved', dbRes));
    } catch (err) {
        logger.error(`Error retrieving member records: ${err}: ${err.stack}`);

        return res.status(500).send(utils.getErrorMessage(`Error retrieving member records: ${err}`));
    }
}

exports.update = async (req, res) => {

    // perform basic validations on data
    const { httpStatus, message } = helper.validateUpdate(req.body);
    if (httpStatus) {
        return res.status(httpStatus).send(utils.getErrorMessage(message));
    }

    try {
        updateResp = await mongoHelper.MongoDB.getInstance().update(req.body, 'member');

        return res.status(200).send(utils.sendSuccess('member record updated'));
    } catch (err) {
        logger.error(`Error updating member records: ${err}: ${err.stack}`);

        return res.status(500).send(utils.getErrorMessage(`Error updating member records: ${err}`));
    }
}