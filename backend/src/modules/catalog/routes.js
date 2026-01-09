const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/countries', controller.listCountries);

module.exports = router;
