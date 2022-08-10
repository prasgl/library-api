const express = require('express');
const books = require('../controllers/books');
const requestLogger = require('../middleware/request-logger');

const router = express.Router();

router.post('/', requestLogger, books.create);
router.get('/:id', requestLogger, books.getById);
router.put('/', requestLogger, books.update);
// router.delete('/:id', books.delete);
router.get('/', requestLogger, books.getByTitle);

module.exports = router;
