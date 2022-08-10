const utils = require('../helpers/utils');
const Logger = require('../config/logger');
const mongoHelper = require('../helpers/mongodb-helper');
const helper = require('../helpers/issue-helper'); 

const logger = new Logger('issue-controller');

exports.create = async (req, res) => {
    const { bookId, memberId } = req.body;
    const { httpStatus, message, member, book } = await helper.validateInsert(bookId, memberId);

    if (message) return res.status(httpStatus).json(utils.getErrorMessage(message));

    try {
        const issueReq = {
            member: {
                id: memberId,
                firstName: member.firstName,
                lastName: member.lastName
            },
            book: {
                id: bookId,
                title: book.title,
                authors: book.authors
            },
            status: "issued"
        };
        const issuedResp = await mongoHelper.MongoDB.getInstance().create(issueReq, 'book_issue');
        return res.status(201).json(utils.sendSuccess('Book issued', issuedResp));
    } catch (err) {
        logger.error(`Error occurred: ${JSON.stringify(err)}`);
    }
};

exports.delete = async (req, res) => {
    if (!utils.validateObjectId(req.params.id)) return res.status(400).json(utils.getErrorMessage('invalid id'));

    let deleteResp;

    try {
        deleteResp = await mongoHelper.MongoDB.getInstance().delete(req.params.id, 'book_issue');
    } catch (err) {
        logger.error(`Error deleting record: ${JSON.stringify(err)}`);
        return res.status(500).json(utils.getErrorMessage('Error deleting issue: ${err'));
    }

    if (deleteResp.deletedCount != 1) {
        return res.status(404).json(utils.getErrorMessage('No issue by that id'));
    }

    return res.status(200).json(utils.sendSuccess('Book returned', deleteResp));
};

exports.getMultiple = async (req, res) => {
    const { httpStatus, message, query } = await helper.validateQuery(req);

    if (message) return res.status(httpStatus).json(utils.getErrorMessage(message));

    const issueDetails = await mongoHelper.MongoDB.getInstance().query(query, 'book_issue');

    if (issueDetails.length === 0) return res.status(400).json(utils.getErrorMessage('No details found'));

    return res.status(200).json(utils.sendSuccess('details of books issued retrieved', issueDetails));
}