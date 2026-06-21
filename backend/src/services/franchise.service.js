const { Franchise, Inventory, ServiceArea, ProductVariant, Product, User } = require('../models');

const createFranchise = async ({ ownerId, name, location, commissionRate }) => {
  const owner = await User.findByPk(ownerId);
  if (!owner || owner.role !== 'franchise') {
    throw new Error('Owner user must have the "franchise" role');
  }
  return await Franchise.create({ ownerId, name, location, commissionRate });
};

const getFranchiseByOwner = async (ownerId) => {
  return await Franchise.findOne({ where: { ownerId } });
};

const getFranchiseInventory = async (franchiseId) => {
  return await Inventory.findAll({
    where: { franchiseId },
    include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }]
  });
};

const updateInventoryStock = async (franchiseId, { variantId, stockCount }) => {
  let inventory = await Inventory.findOne({ where: { franchiseId, variantId } });
  if (!inventory) {
    // Create if it doesn't exist yet
    inventory = await Inventory.create({
      franchiseId,
      variantId,
      stockCount,
      lowStockThreshold: 10
    });
  } else {
    inventory.stockCount = stockCount;
    await inventory.save();
  }
  return inventory;
};

const addServiceArea = async (franchiseId, { pincode, areaName, deliveryCharge }) => {
  return await ServiceArea.create({
    pincode,
    areaName,
    franchiseId,
    deliveryCharge: deliveryCharge || 0.00
  });
};

const getServiceAreas = async (franchiseId = null) => {
  const filter = {};
  if (franchiseId) {
    filter.franchiseId = franchiseId;
  }
  return await ServiceArea.findAll({
    where: filter,
    include: [{ model: Franchise, as: 'franchise' }]
  });
};

module.exports = {
  createFranchise,
  getFranchiseByOwner,
  getFranchiseInventory,
  updateInventoryStock,
  addServiceArea,
  getServiceAreas
};
