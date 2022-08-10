const utils = require('./utils');

const mandatoryFields = ["firstName", "lastName", "address", "mobile"];

exports.validateInsert = (doc) => {
    const missingFields = utils.fieldsPresent(doc, mandatoryFields);
    if (missingFields.length > 0) {
        return { httpStatus: 400, message: `Missing fields: ${missingFields}` };
    }

    if (!utils.validateMobile(doc.mobile)) return { httpStatus: 400, message: 'Invalid mobile number' };

    return {};
}

exports.validateUpdate = (doc) => {
    if (!doc._id?.trim() || !utils.validateObjectId(doc._id)) return {httpStatus: 400, message: `invalid _id`}

    const blankedFields = utils.fieldsBlanked(doc, mandatoryFields);
    if (blankedFields.length > 0) {
        return {httpStatus: 400, message: `Mandatory field/s removed: ${blankedFields}`}
    } 

    if (doc.mobile?.trim() && !utils.validateMobile(doc.mobile)) return { httpStatus: 400, message: 'Invalid mobile number' };

    return {};
}