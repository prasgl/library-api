/* eslint-disable no-underscore-dangle */
const { ObjectId } = require('mongodb');

const Logger = require('../config/logger');
const constants = require('./constants');

const logger = new Logger('utils');

// eslint-disable-next-line complexity
exports.getErrorInfo = (error) => {
    let errorStatus;
    let errorMsg;

    if (error.code && error.code === constants.ERROR_CODES.TIMEOUT) {
        errorStatus = 500;
        errorMsg = 'connection to external API timed out';
    } else if (error.response) {
        // server received request and responded with error (4xx, 5xx)
        errorStatus = error.response.status;
        errorMsg = error.response.data;

        // some components wrap their errors differently
        if (typeof errorMsg === 'object') {
            errorMsg = errorMsg.error.message || errorMsg.message;
        }
    } else if (error.request) {
        // server never received request
        errorStatus = error.request.res.statusCode;
        errorMsg = error.request.res.statusMessage;
    } else {
        logger.error(error);
        errorStatus = 500;
        errorMsg = 'unknown server error';
    }

    return { errorStatus, errorMsg };
};

exports.logAndSendErrorResponse = (txID, res, error, functionText) => {
    const { errorStatus, errorMsg } = this.getErrorInfo(error);
    const message = `Failed to ${functionText} :: ${errorMsg}`;

    logger.error(`Received ${errorStatus} error: ${message}`, txID);
    return res.status(errorStatus).json({
        error: {
            message,
        },
    });
};

exports.getErrorMessage = (message) => {
    return {
        error: {
            message
        }
    }
}

exports.getErrorMessageWithPayload = (message, payload) =>{
    return {
        error: {
            message,
            payload
        }
    }
}

exports.sendSuccess = (message, payload) => {
    return { message, payload}
}

exports.sendErrorMessageWithCode = (code, message) => {
    if(!code) this.getErrorMessage(message);
    return {
        error: {
            code , message
        }
    }
}

/**
 * Ensure all `fields` are present in `doc`. return array containing the fields not present.
 * @param {*} doc in which to check if all `fields` are present
 * @param {*} fields array of strings
 */
exports.fieldsPresent = (doc, fields) => {
    let fieldsAbsent = [];
    fields.forEach(f => {
        if (!doc[f] || (typeof doc[f] === 'string' && doc[f].trim() === ''))
            fieldsAbsent.push(f);
    })
    return fieldsAbsent;
}

exports.fieldsBlanked = (doc, fields) => {
    let blanked = [];
    for (const [k, v] of Object.entries(doc)) {
        if (fields.includes(k) && typeof v === 'string' && !v.trim()) blanked.push(k)
    }
    return blanked;
}

/**
 * trim all fields in `doc`
 * @param {object} doc 
 * @returns 
 */
exports.trim = (doc) => {

    let trimmed;

    if (typeof doc === 'string') {
        trimmed = doc.trim();
    } else if (Array.isArray(doc)) {
        trimmed = doc.map(e => typeof e === 'string' ? e.trim() : this.trim(e));
    }
    else if (typeof doc === 'object') {
        trimmed = {};
        for (const [k, v] of Object.entries(doc)) {
            if (typeof v === 'string') {
                trimmed[k] = v.trim()
            }
            else if (Array.isArray(v)) {
                trimmed[k] = v.map(e => typeof e === 'string' ? e.trim() : this.trim(e));
            }
            else if (typeof v === 'object') {
                trimmed[k] = this.trim(v);
            }
            else trimmed[k] = v;
        }
    } else trimmed = doc;
    return trimmed;
}

exports.validateMobile = (mobile) => {
    const mob = mobile.replaceAll(/[\s-]/g, '');
    if (mob.length !== 10 || mob.match(/\D/)) {
        return ""
    }
    return mob;
}

exports.validateObjectId = (id) => {
    return ObjectId.isValid(id) && (String)(new ObjectId(id)) === id
}