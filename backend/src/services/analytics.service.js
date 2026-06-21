const { Order, Subscription, Inventory, SupportTicket, Franchise, Wallet, ProductVariant, Product } = require('../models');
const { Op } = require('sequelize');

const getAdminStats = async () => {
  // 1. Total revenue
  const orders = await Order.findAll({ where: { status: ['placed', 'processing', 'shipped', 'delivered'] } });
  const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

  // 2. Orders count
  const totalOrdersCount = orders.length;

  // 3. Subscription count
  const activeSubscriptions = await Subscription.count({ where: { status: 'active' } });

  // 4. Low stock products
  const lowStockItems = await Inventory.findAll({
    where: {
      stockCount: {
        [Op.lte]: sequelize => sequelize.col('low_stock_threshold')
      }
    },
    include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }]
  });

  // 5. Support tickets backlog
  const openTickets = await SupportTicket.count({ where: { status: ['open', 'in-progress'] } });

  // 6. Wallets reserves
  const wallets = await Wallet.findAll();
  const totalWalletReserve = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance), 0);

  // 7. Franchise metrics
  const franchises = await Franchise.findAll({
    include: [{ model: Order, as: 'orders' }]
  });

  const franchisePerformances = franchises.map(f => {
    const sales = f.orders ? f.orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0) : 0;
    return {
      id: f.id,
      name: f.name,
      commissionRate: f.commissionRate,
      earnings: f.earnings,
      ordersCount: f.orders ? f.orders.length : 0,
      totalSales: sales
    };
  });

  return {
    revenue: totalSales,
    ordersCount: totalOrdersCount,
    activeSubscriptions,
    lowStockWarnings: lowStockItems.length,
    openTickets,
    walletReserve: totalWalletReserve,
    franchiseStats: franchisePerformances
  };
};

const getFranchiseStats = async (franchiseId) => {
  // 1. Total franchise orders
  const orders = await Order.findAll({
    where: { franchiseId, status: ['placed', 'processing', 'shipped', 'delivered'] }
  });
  const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

  // 2. Franchise earnings
  const franchise = await Franchise.findByPk(franchiseId);
  const earnings = franchise ? parseFloat(franchise.earnings) : 0;

  // 3. Low stock inventory for this franchise
  const lowStockCount = await Inventory.count({
    where: {
      franchiseId,
      stockCount: {
        [Op.lte]: sequelize => sequelize.col('low_stock_threshold')
      }
    }
  });

  return {
    sales: totalSales,
    ordersCount: orders.length,
    earnings,
    lowStockWarnings: lowStockCount
  };
};

module.exports = {
  getAdminStats,
  getFranchiseStats
};
