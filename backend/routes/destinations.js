const express = require('express');
const { getDestinations, getDestination, getPopularDestinations, searchDestinations } = require('../controllers/destinationController');

const router = express.Router();

router.get('/', getDestinations);
router.get('/popular', getPopularDestinations);
router.get('/search', searchDestinations);
router.get('/:id', getDestination);

module.exports = router;