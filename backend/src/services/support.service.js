const { SupportTicket } = require('../models');

const createTicket = async (userId, { subject, description, priority }) => {
  if (!subject || !description) {
    throw new Error('Subject and description are required');
  }
  return await SupportTicket.create({
    userId,
    subject,
    description,
    priority: priority || 'low'
  });
};

const getMyTickets = async (userId) => {
  return await SupportTicket.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']]
  });
};

const getAllTickets = async () => {
  return await SupportTicket.findAll({
    order: [['createdAt', 'DESC']]
  });
};

const updateTicketStatus = async (ticketId, { status }) => {
  const ticket = await SupportTicket.findByPk(ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  ticket.status = status;
  await ticket.save();
  return ticket;
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus
};
