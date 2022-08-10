const express = require('express');
const issue = require('../controllers/issue');
const requestLogger = require('../middleware/request-logger');

const router = express.Router();

router.post('/', requestLogger, issue.create);
router.get('/', requestLogger, issue.getMultiple);
// router.put('/', issue.update);
router.delete('/:id', issue.delete);

module.exports = router;
