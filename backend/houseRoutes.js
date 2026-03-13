const express = require('express');
const router = express.Router();
const { addHouse, getHouses, updateHouse, deleteHouse } = require('./houseController');
const { protect } = require('./authMiddleware');
const adminAuth = require('./middleware/adminAuth');

router.route('/').get(getHouses).post(protect, addHouse);
router.route('/:id').put(adminAuth, updateHouse).delete(adminAuth, deleteHouse);

module.exports = router;