const chai = require('chai');
// const sinon = require('sinon');
// const sinonChai = require('sinon-chai');
const utilsMock = require('../../helpers/utils');

const { expect } = chai;
// const sandbox = sinon.createSandbox();

// chai.use(sinonChai);

describe('utils', () => {
    describe('validateMobile', () => {
        it('should ignore white spaces and hyphens', () => {
            const actual = utilsMock.validateMobile('839-83 932-92');
            expect(actual).to.equal('8398393292');
        });
    
        it('should allow only ten-digit numbers', () => {
            const actualNineDigit = utilsMock.validateMobile('333 333 333');
            expect(actualNineDigit, 'nine-digit accepted!').to.equal("");
    
            const actualElevenDigit = utilsMock.validateMobile('333 333 333 33');
            expect(actualElevenDigit, 'eleven-digit accepted!').to.equal("");

            const actualAlphanumeric = utilsMock.validateMobile('123 abc def9');
            expect(actualAlphanumeric, 'alphanumeric accepted!').to.equal("");
        });
    });

    describe('trim', () => {
        it('should trim spaces, tabs and newlines from strings', () => {
            const actual = utilsMock.trim("\t ddfn\n ");
            expect(actual).to.equal("ddfn");
        });

        it('should trim spaces, tabs and newlines from array elements', () => {
            const input = ["\t ddfn\n "];

            const expected = ["ddfn"];

            const actual = utilsMock.trim(input);

            actual.forEach((e, i) => expect(e).to.equal(expected[i]));
        });

        it('should trim all string data from an object', () => {
            const input = {
                a: " dscx ",
                b: [" 123  "],
                c: {
                   d: " sds " 
                }
            };

            const expected = {
                a: "dscx",
                b: ["123"],
                c: {
                   d: "sds" 
                }
            };

            const actual = utilsMock.trim(input);

            expect(actual).to.deep.equal(expected);
        });

        it('should leave non-string, non-object data as-is', () => {
            const booleanData = true;
            const numericData = 834034;
            expect(utilsMock.trim(booleanData)).to.equal(booleanData);
            expect(utilsMock.trim(numericData)).to.equal(numericData);
        });
    });

    describe('fieldsPresent', () => {
        it('should return list of fields not present', () => {
            const doc = {
                a: 1,
                b: 'abc',
                c: true
            };
            const list = ["a", "x", "y"];
            expected = ["x", "y"];
            actual = utilsMock.fieldsPresent(doc, list);
            expect(actual, 'x & y are not present!').to.deep.equal(expected);

            const list2 = ["a", "b", "c"];
            expect(utilsMock.fieldsPresent(doc, list2), 'all fields present!').to.deep.equal([]);
        })
    });

    describe('fieldsBlanked', () => {
        it('should return list of fields blanked', () => {
            const doc = { a: " ", b: "xyz", c: 1, d: true};
            const list = ["a", "b", "c"];
            const expected = ["a"];
            expect(utilsMock.fieldsBlanked(doc, list), "'a' was mandatory!").to.deep.equal(expected);

            const list2 = ["b", "c"];
            expect(utilsMock.fieldsBlanked(doc, list2), 'none should have been listed!').to.deep.equal([]);
        })
    })

})
