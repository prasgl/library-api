const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { mockReq, mockRes } = require('sinon-express-mock');
const membersMockController = require('../../controllers/members');
const mongoMockHelper = require('../../helpers/mongodb-helper');

const { expect } = chai;
const sandbox = sinon.createSandbox();

chai.use(sinonChai);

const mandatoryFields = ["firstName", "lastName", "address", "mobile"];

const memberInfo = {
    "firstName": "Rajesh",
    "lastName": "Patil",
    "address": "#23, M G Road, Shivaji Nagar, Sangli, PIN 463012, India",
    "mobile": "1234567890"
}

const genResp = {};

describe('members api', () => {
    afterEach(() => {
        sandbox.restore();
    });
    describe('/post members', async () => {
        beforeEach(() => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'create').resolves(genResp);
        });

        it('mandatory fields missing for a member', async () => {
            mandatoryFields.forEach(async field => {
                const memberDetail = { ...memberInfo };
                delete memberDetail[field];
                const req = mockReq({
                    body: memberDetail,
                });
                const res = mockRes();
                await membersMockController.create(req, res);
                expect(res.status, `Allowed to miss ${field}!`).calledWith(400);
            })
        });

        it('mandatory fields blank for a member', async () => {
            mandatoryFields.forEach(async field => {
                const memberDetail = { ...memberInfo };
                memberDetail[field] = "  ";
                const req = mockReq({
                    body: memberDetail,
                });
                const res = mockRes();
                await membersMockController.create(req, res);
                expect(res.status, `Allowed to blank ${field}!`).calledWith(400);
            })
        });

        it('non-numeric mobile number', async () => {
            const memberDetail = { ...memberInfo };
            memberDetail.mobile = "123456789a";
            const req = mockReq({
                body: memberDetail,
            });
            const res = mockRes();
            await membersMockController.create(req, res);
            expect(res.status).calledWith(400);
        });

        it('non-ten-digit mobile number', async () => {
            const memberDetail = { ...memberInfo };
            ["123456789", "12345678901"].forEach(async m => {
                memberDetail.mobile = m;
                const req = mockReq({
                    body: memberDetail,
                });
                const res = mockRes();
                await membersMockController.create(req, res);
                expect(res.status, `non-ten-digit mobile ${m} allowed!`).calledWith(400);
            })
        });

        it('hyphens and spaces allowed in mobile number', async () => {
            const memberDetail = { ...memberInfo };
            memberDetail.mobile = "999 34210-21";
            const req = mockReq({
                body: memberDetail,
            });
            const res = mockRes();
            await membersMockController.create(req, res);
            expect(res.status).calledWith(201);
        });
    });

    describe('PUT /members', async () => {
        beforeEach(() => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'update').resolves(genResp);
        });

        it('_id must be specified', async () => {
            const memberDetail = { ...memberInfo };
            const req = mockReq({
                body: memberDetail,
            });
            const res = mockRes();
            await membersMockController.update(req, res);
            expect(res.status).calledWith(400);
        });

        it('mandatory fields blanked', async () => {
            mandatoryFields.forEach(async field => {
                const memberDetail = { ...memberInfo, _id: "dummy" };
                memberDetail[field] = "  ";
                const req = mockReq({
                    body: memberDetail,
                });
                const res = mockRes();
                await membersMockController.update(req, res);
                expect(res.status, `Allowed to miss ${field}!`).calledWith(400);
            })
        });

        it('non-ten-digit mobile number', async () => {
            const memberDetail = { ...memberInfo, _id: "dummy" };
            ["123456789", "12345678901"].forEach(async m => {
                memberDetail.mobile = m;
                const req = mockReq({
                    body: memberDetail,
                });
                const res = mockRes();
                await membersMockController.update(req, res);
                expect(res.status, `non-ten-digit mobile ${m} allowed!`).calledWith(400);
            })
        });

        it('hyphens and spaces allowed in mobile number', async () => {
            const memberDetail = { ...memberInfo, _id: "62d7a2971a9d73fbabe79ab1" };
            memberDetail.mobile = "999 34210-21";
            const req = mockReq({
                body: memberDetail,
            });
            const res = mockRes();
            await membersMockController.update(req, res);
            expect(res.status).calledWith(200);
        });
    });

    describe('GET /members/:id', async () => {
        it('id must be specified as path parameter', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read').resolves(genResp);
            const req = mockReq({
                params: {
                }
            });
            const res = mockRes();
            await membersMockController.getById(req, res);
            expect(res.status).calledWith(400);
        });

        it('member not found', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read').resolves(null);
            const req = mockReq({
                params: {
                    id: "62d7a2971a9d73fbabe79ab1"
                }
            });
            const res = mockRes();
            await membersMockController.getById(req, res);
            expect(res.status).calledWith(404);
        });

        it('Record matching the specified member id should be retrieved', async () => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'read').resolves(genResp);
            const req = mockReq({
                params: {
                    id: "62d7a2971a9d73fbabe79ab1"
                }
            });
            const res = mockRes();
            await membersMockController.getById(req, res);
            expect(res.status).calledWith(200);
        });

    });

    describe('GET /members', async () => {
        beforeEach(() => {
            sandbox.stub(mongoMockHelper.MongoDB.getInstance(), 'query').resolves(null);
        });

        it('Either first name or last name must be specified', async () => {
            const req = mockReq({
                query: {}
            });
            const res = mockRes();
            await membersMockController.getByName(req, res);
            expect(res.status).calledWith(400);
        });

        it('First and last name if specified, must be string data', async () => {
            const fnameValues = [39833, "dkjfds"];
            const lnameValues = [9894, "xckids"];
            for(let i = 0; i < fnameValues.length; i++) {
                for (let j = 0; j < lnameValues.length; j++) {
                    const req = mockReq({
                        query: { firstName: fnameValues[i], lastName: lnameValues[j]}
                    });
                    const res = mockRes();
                    const fnameType = typeof req.query.firstName;
                    const lnameType = typeof req.query.lastName
                    await membersMockController.getByName(req, res);
                    expect(res.status, `${fnameType} ${lnameType}`).calledWith(
                        fnameType === 'string' && lnameType === 'string' ? 200 : 400);
                }
            }
        });
    })
})