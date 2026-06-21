const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.use(protect);

router.post('/', supportController.createTicket);
router.get('/', supportController.getMyTickets);
router.get('/all', restrictTo('admin'), supportController.getAllTickets);
router.put('/:id', restrictTo('admin'), supportController.updateTicketStatus);

module.exports = router;
