const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { mockReq, mockRes } = require('sinon-express-mock');
const booksMockController = require('../../controllers/books');
const mongoMockHelper = require('../../helpers/mongodb-helper');

const { expect } = chai;
const sandbox = sinon.createSandbox();

chai.use(sinonChai);

const mandatoryFields = ["title", "authors", "publisher"];

const bookInfo = {
    title: "Contact",
    authors: [ "Karl Sagan" ],
    publisher: "Random House"
};

const genResp = {};

describe('books api', () => {
    afterEach(() => {
        sandbox.restore();
    });
    describe('/post books', async () => {
        beforeEach(() => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'create').resolves(genResp);
        });

        it('mandatory fields missing for a book', async () => {
            mandatoryFields.forEach(async field => {
                const bookDetail = { ...bookInfo };
                delete bookDetail[field];
                const req = mockReq({
                    body: bookDetail,
                });
                const res = mockRes();
                await booksMockController.create(req, res);
                expect(res.status, `Allowed to miss ${field}!`).calledWith(400);
            })
        });

        it('mandatory fields blank for a book', async () => {
            mandatoryFields.forEach(async field => {
                const bookDetail = { ...bookInfo };
                bookDetail[field] = "  ";
                const req = mockReq({
                    body: bookDetail,
                });
                const res = mockRes();
                await booksMockController.create(req, res);
                expect(res.status, `Allowed to blank ${field}!`).calledWith(400);
            });
        });

        it('valid input should create a book record', async () => {
            const bookDetail = { ...bookInfo };
            const req = mockReq({
                body: bookDetail,
            });
            const res = mockRes();
            await booksMockController.create(req, res);
            expect(res.status).calledWith(201);
        });
    });

    describe('PUT /books', async () => {
        beforeEach(() => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'update').resolves(genResp);
        });

        it('_id must be specified', async () => {
            const bookDetail = { ...bookInfo };
            const req = mockReq({ body: bookDetail });
            const res = mockRes();
            await booksMockController.update(req, res);
            expect(res.status).calledWith(400);
        });

        it('mandatory fields blank for a book', async () => {
            mandatoryFields.forEach(async field => {
                const bookDetail = { ...bookInfo, _id: "dummy" };
                bookDetail[field] = "  ";
                const req = mockReq({
                    body: bookDetail,
                });
                const res = mockRes();
                await booksMockController.update(req, res);
                expect(res.status, `Allowed to blank ${field}!`).calledWith(400);
            });
        });

        it('valid input should update book record', async () => {
            const bookDetail = { ...bookInfo, _id: "62da304d121217f31793327d" };
            const req = mockReq({
                body: bookDetail,
            });
            const res = mockRes();
            await booksMockController.update(req, res);
            expect(res.status).calledWith(200);
        });
    });

    describe('GET /books/:id', async () => {
        it('id must be specified as path parameter', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read').resolves(genResp);
            const req = mockReq({
                params: {
                }
            });
            const res = mockRes();
            await booksMockController.getById(req, res);
            expect(res.status).calledWith(400);
        });

        it('book not found', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read').resolves(null);
            const req = mockReq({
                params: {
                    id: "62da304d121217f31793327d"
                }
            });
            const res = mockRes();
            await booksMockController.getById(req, res);
            expect(res.status).calledWith(404);
        });

        it('book record matching the id should be retrieved', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read').resolves(genResp);
            const req = mockReq({
                params: {
                    id: "62da304d121217f31793327d"
                }
            });
            const res = mockRes();
            await booksMockController.getById(req, res);
            expect(res.status).calledWith(200);
        });

    });

    describe('GET /books', async () => {
        beforeEach(() => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'query').resolves(genResp);
        });

        it('book title must be specified', async () => {
            const req = mockReq({
                query: {}
            });
            const res = mockRes();
            await booksMockController.getByTitle(req, res);
            expect(res.status).calledWith(400);
        });

        it('book title must be string', async () => {
            const req = mockReq({
                query: { title: true }
            });
            const res = mockRes();
            await booksMockController.getByTitle(req, res);
            expect(res.status).calledWith(400);
        });

        it('book record matching the title should be retrieved', async () => {
            const req = mockReq({
                query: { title: "Contact" }
            });
            const res = mockRes();
            await booksMockController.getByTitle(req, res);
            expect(res.status).calledWith(200);
        });
    })
});