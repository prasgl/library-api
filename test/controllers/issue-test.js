const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { mockReq, mockRes } = require('sinon-express-mock');
const issueMockController = require('../../controllers/issue');
const mongoMockHelper = require('../../helpers/mongodb-helper');

const { expect } = chai;
const sandbox = sinon.createSandbox();

chai.use(sinonChai);

const issueDetail = {
    bookId: '62da304d121217f31793327d',
    memberId: '62d7a2971a9d73fbabe79ab1',
}

const genResp = {};

describe('issue api', async () => {
    afterEach(() => {
        sandbox.restore();
    });

    describe('POST /issue', async () => {
        beforeEach(() => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'create').resolves(genResp);
        });

        it('should specify book id and member id', async () => {
            const reqWoBookId = { ...issueDetail };
            delete reqWoBookId.bookId;
            const reqWoBook = mockReq({
                body: reqWoBookId,
            });
            const res = mockRes();
            await issueMockController.create(reqWoBook, res);
            expect(res.status, `Allowed to miss book id!`).calledWith(400);

            const reqWoMemberId = { ...issueDetail };
            delete reqWoMemberId.memberId;
            const reqWoMember = mockReq({
                body: reqWoMemberId,
            });
            await issueMockController.create(reqWoMember, res);
            expect(res.status, `Allowed to miss member id!`).calledWith(400);
        });

        it('specified member id should exist', async () => {
            const reqData = { ...issueDetail };
            const req = mockReq({
                body: reqData,
            });
            const res = mockRes();

            const stub = sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read');
            stub.onCall(0).resolves(null); // retrieve member

            await issueMockController.create(req, res);
            expect(res.status).calledWith(400);
        });

        it('specified book id should exist', async () => {
            const reqData = { ...issueDetail };
            const req = mockReq({
                body: reqData,
            });
            const res = mockRes();
    
            const stub = sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read');
            stub.onCall(0).resolves(genResp); // retrieve member 
            stub.onCall(1).resolves(null); // retrieve book

            await issueMockController.create(req, res);
            expect(res.status).calledWith(400);
        });

        it('the book should not have been issued', async () => {
            const reqData = { ...issueDetail };
            const req = mockReq({
                body: reqData,
            });
            const res = mockRes();
    
            const readStub = sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read');
            readStub.onCall(0).resolves(genResp); // retrieve member 
            readStub.onCall(1).resolves(genResp); // retrieve book

            const queryStub = sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'query');
            queryStub.resolves([genResp]); // retrieve issue (to get member id to whom the book is issued)

            await issueMockController.create(req, res);
            expect(res.status).calledWith(400);
        });

        it('book issued', async () => {
            const reqData = { ...issueDetail };
            const req = mockReq({
                body: reqData,
            });
            const res = mockRes();
    
            const readStub = sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read');
            readStub.onCall(0).resolves(genResp); // retrieve member 
            readStub.onCall(1).resolves(genResp); // retrieve book

            const queryStub = sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'query');
            queryStub.resolves([]); // retrieve issue (to get member id to whom the book is issued)

            await issueMockController.create(req, res);
            expect(res.status).calledWith(201);
        })

    });

    describe('DELETE /issue', async () => {
        it('should specify valid issue id', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'delete').resolves(genResp);

            const req = mockReq({
                params: {
                    id: 'invalid-id'
                },
            });
            const res = mockRes();

            await issueMockController.delete(req, res);
            expect(res.status).calledWith(400);
        });

        it('should specify existing issue id', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'delete').resolves({deletedCount: 0});
            const req = mockReq({
                params: {
                    id: '62da304d121217f31793327d'
                },
            });
            const res = mockRes();

            await issueMockController.delete(req, res);
            expect(res.status).calledWith(404);
        });

        it('should successfully delete record', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'delete').resolves({deletedCount: 1});
            const req = mockReq({
                params: {
                    id: '62da304d121217f31793327d'
                },
            });
            const res = mockRes();

            await issueMockController.delete(req, res);
            expect(res.status).calledWith(200);
        });
    });

    describe('GET /issue', async () => {
        it('should specify either book id or member id', async () => {
            const req = mockReq({
                query: {
                    bookId: 'invalid-id',
                    memberId: 'junk-id'
                },
            });
            const res = mockRes();

            await issueMockController.getMultiple(req, res);
            expect(res.status).calledWith(400);
        });

        it('should specify valid book id', async () => {
            const req = mockReq({
                query: {
                    bookId: 'invalid-id'
                },
            });
            const res = mockRes();

            await issueMockController.getMultiple(req, res);
            expect(res.status).calledWith(400);
        });

        it('should specify existing book id', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read').resolves(null);
            const req = mockReq({
                query: {
                    bookId: '62da304d121217f31793327d'
                },
            });
            const res = mockRes();

            await issueMockController.getMultiple(req, res);
            expect(res.status).calledWith(400);
        });

        it('should specify issued book id', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read').resolves(genResp); // read 'book'
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'query').resolves([]); // read 'book_issue'

            const req = mockReq({
                query: {
                    bookId: '62da304d121217f31793327d'
                },
            });
            const res = mockRes();

            await issueMockController.getMultiple(req, res);
            expect(res.status).calledWith(400);
        });

        it('given an issued book id, should return details of book issue', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read').resolves(genResp); // read 'book'
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'query').resolves([{}]); // read 'book_issue'

            const req = mockReq({
                query: {
                    bookId: '62da304d121217f31793327d'
                },
            });
            const res = mockRes();

            await issueMockController.getMultiple(req, res);
            expect(res.status, JSON.stringify(res)).calledWith(200);
        });

        it('should specify valid member id', async () => {
            const req = mockReq({
                query: {
                    memberId: 'invalid-id'
                },
            });
            const res = mockRes();

            await issueMockController.getMultiple(req, res);
            expect(res.status).calledWith(400);
        });

        it('should specify existing member id', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read').resolves(null);
            const req = mockReq({
                query: {
                    memberId: '62da304d121217f31793327d'
                },
            });
            const res = mockRes();

            await issueMockController.getMultiple(req, res);
            expect(res.status).calledWith(400);
        });

        it('given a member id to whom book is issued, should return details of book issue', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read').resolves(genResp); // read 'member'
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'query').resolves([{}]); // read 'book_issue'

            const req = mockReq({
                query: {
                    memberId: '62da304d121217f31793327d'
                },
            });
            const res = mockRes();

            await issueMockController.getMultiple(req, res);
            expect(res.status, JSON.stringify(res)).calledWith(200);
        });

    });
});