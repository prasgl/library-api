const mongoHelper = require('./mongodb-helper');
const utils = require('./utils');
const Logger = require('../config/logger');

const logger = new Logger('issue-helper');

exports.validateInsert = async (bookId, memberId) => {
    if (!bookId || !utils.validateObjectId(bookId) || !memberId || !utils.validateObjectId(memberId)) 
        return { httpStatus: 400, message: 'both book id and member id must be valid' };

    let member, book;
    try {
        member = await mongoHelper.MongoDB.getInstance().read(memberId, 'member');
        if (!member) return { httpStatus: 400, message: 'No member by that id exists!' };

        book = await mongoHelper.MongoDB.getInstance().read(bookId, 'book');
        if (!book) return { httpStatus: 400, message: 'No book by that id exists!' };

        const criteria = { "book.id": bookId };
        const bookIssuedTo = await mongoHelper.MongoDB.getInstance().query(criteria, 'book_issue');
        if (bookIssuedTo.length > 0) return { httpStatus: 400, message: 'Book already issued' };
    } catch (err) {
        logger.error(`Error validating issue: ${JSON.stringify(err)}`)
        return { httpStatus: 500, message: err.toString() };
    }

    return { member, book };
}

exports.validateQuery = async (req) => {
    const { bookId, memberId } = req.query;
    if ((!bookId && !memberId) || (bookId && memberId)) {
        return { httpStatus: 400, message: 'Specify either book id or member id' };
    }
    let query = {};

    if (bookId) {
        if (!utils.validateObjectId(bookId))
            return { httpStatus: 400, message: 'invalid book id' };

        const book = await mongoHelper.MongoDB.getInstance().read(bookId, 'book');
    
        if (!book)
            return { httpStatus: 400, message: 'No book by that id' };
        query["book.id"] = bookId;
    
    } else if (memberId) {
        if (!utils.validateObjectId(memberId))
            return { httpStatus: 400, message: 'invalid member id' };
        const member = await mongoHelper.MongoDB.getInstance().read(memberId, 'member');
    
        if (!member)
            return { httpStatus: 400, message: 'No member by that id' };
        query["member.id"] = memberId;

    }
    return { query }
}