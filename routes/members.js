const express = require('express');
const members = require('../controllers/members');
const requestLogger = require('../middleware/request-logger');

const router = express.Router();

router.post('/', requestLogger, members.create);
router.get('/:id', requestLogger, members.getById);
router.put('/', requestLogger, members.update);
// router.delete('/:id', requestLogger, members.delete);
router.get('/', requestLogger, members.getByName);

module.exports = router;
