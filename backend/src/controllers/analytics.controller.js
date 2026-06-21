const analyticsService = require('../services/analytics.service');
const franchiseService = require('../services/franchise.service');

const getStats = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const stats = await analyticsService.getAdminStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } else if (req.user.role === 'franchise') {
      const franchise = await franchiseService.getFranchiseByOwner(req.user.id);
      if (!franchise) {
        return res.status(404).json({ success: false, message: 'Franchise not found' });
      }
      const stats = await analyticsService.getFranchiseStats(franchise.id);
      return res.status(200).json({
        success: true,
        data: stats
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Analytics restricted to Admin and Franchise owners.'
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getStats
};
