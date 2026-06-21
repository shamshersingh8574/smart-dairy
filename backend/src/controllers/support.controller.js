const supportService = require('../services/support.service');

const createTicket = async (req, res, next) => {
  try {
    const ticket = await supportService.createTicket(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully',
      data: ticket
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await supportService.getMyTickets(req.user.id);
    return res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await supportService.getAllTickets();
    return res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await supportService.updateTicketStatus(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: ticket
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus
};
