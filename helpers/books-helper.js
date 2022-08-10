const utils = require('./utils');

const mandatoryFields = ["title", "authors", "publisher"];

exports.validateInsert = (doc) => {
    const missingFields = utils.fieldsPresent(doc, mandatoryFields);
    if (missingFields.length > 0) {
        return { httpStatus: 400, message: `Missing fields: ${missingFields}` };
    }

    return {};
}

exports.validateUpdate = (doc) => {
    if (!doc._id?.trim() || !utils.validateObjectId(doc._id)) return {httpStatus: 400, message: `invalid _id`}

    const blankedFields = utils.fieldsBlanked(doc, mandatoryFields);
    if (blankedFields.length > 0) {
        return {httpStatus: 400, message: `Mandatory field/s removed: ${blankedFields}`}
    } 

    return {};
}