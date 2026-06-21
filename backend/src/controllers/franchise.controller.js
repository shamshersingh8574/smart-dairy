const franchiseService = require('../services/franchise.service');

const createFranchise = async (req, res, next) => {
  try {
    const franchise = await franchiseService.createFranchise(req.body);
    return res.status(201).json({
      success: true,
      message: 'Franchise created successfully',
      data: franchise
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getMyFranchise = async (req, res, next) => {
  try {
    const franchise = await franchiseService.getFranchiseByOwner(req.user.id);
    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'No franchise associated with this user'
      });
    }
    return res.status(200).json({
      success: true,
      data: franchise
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getInventory = async (req, res, next) => {
  try {
    const franchise = await franchiseService.getFranchiseByOwner(req.user.id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }
    const inventory = await franchiseService.getFranchiseInventory(franchise.id);
    return res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateInventory = async (req, res, next) => {
  try {
    const franchise = await franchiseService.getFranchiseByOwner(req.user.id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }
    const inventory = await franchiseService.updateInventoryStock(franchise.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: inventory
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const addServiceArea = async (req, res, next) => {
  try {
    const franchise = await franchiseService.getFranchiseByOwner(req.user.id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }
    const area = await franchiseService.addServiceArea(franchise.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Service area added successfully',
      data: area
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getServiceAreas = async (req, res, next) => {
  try {
    const areas = await franchiseService.getServiceAreas();
    return res.status(200).json({
      success: true,
      data: areas
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createFranchise,
  getMyFranchise,
  getInventory,
  updateInventory,
  addServiceArea,
  getServiceAreas
};
