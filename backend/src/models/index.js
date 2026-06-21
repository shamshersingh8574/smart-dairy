const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Address = require('./Address');
const Category = require('./Category');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const ProductImage = require('./ProductImage');
const Inventory = require('./Inventory');
const Cart = require('./Cart');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const Subscription = require('./Subscription');
const Wallet = require('./Wallet');
const WalletTransaction = require('./WalletTransaction');
const Referral = require('./Referral');
const ServiceArea = require('./ServiceArea');
const Franchise = require('./Franchise');
const Delivery = require('./Delivery');
const SupportTicket = require('./SupportTicket');
const Notification = require('./Notification');

// Establish associations

// 1. User & Address
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 2. User & Wallet
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 3. Wallet & WalletTransaction
Wallet.hasMany(WalletTransaction, { foreignKey: 'walletId', as: 'transactions' });
WalletTransaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

// 4. Category & Product
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// 5. Product & ProductVariant
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// 6. ProductVariant & ProductImage
ProductVariant.hasMany(ProductImage, { foreignKey: 'variantId', as: 'images' });
ProductImage.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

// 7. ProductVariant, Franchise & Inventory
ProductVariant.hasMany(Inventory, { foreignKey: 'variantId', as: 'inventories' });
Inventory.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

Franchise.hasMany(Inventory, { foreignKey: 'franchiseId', as: 'inventories' });
Inventory.belongsTo(Franchise, { foreignKey: 'franchiseId', as: 'franchise' });

Franchise.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
User.hasMany(Franchise, { foreignKey: 'ownerId', as: 'franchises' });

// 8. User, ProductVariant & Cart
User.hasMany(Cart, { foreignKey: 'userId', as: 'cartItems' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

ProductVariant.hasMany(Cart, { foreignKey: 'variantId', as: 'cartItems' });
Cart.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

// 9. Order Associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Address.hasMany(Order, { foreignKey: 'addressId', as: 'orders' });
Order.belongsTo(Address, { foreignKey: 'addressId', as: 'address' });

Franchise.hasMany(Order, { foreignKey: 'franchiseId', as: 'orders' });
Order.belongsTo(Franchise, { foreignKey: 'franchiseId', as: 'franchise' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

ProductVariant.hasMany(OrderItem, { foreignKey: 'variantId', as: 'orderItems' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

// 10. Order, Payment & Delivery
Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Order.hasOne(Delivery, { foreignKey: 'orderId', as: 'delivery' });
Delivery.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

User.hasMany(Delivery, { foreignKey: 'deliveryAgentId', as: 'deliveries' });
Delivery.belongsTo(User, { foreignKey: 'deliveryAgentId', as: 'deliveryAgent' });

// 11. Subscription Associations
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

ProductVariant.hasMany(Subscription, { foreignKey: 'variantId', as: 'subscriptions' });
Subscription.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

Address.hasMany(Subscription, { foreignKey: 'addressId', as: 'subscriptions' });
Subscription.belongsTo(Address, { foreignKey: 'addressId', as: 'address' });

// 12. Referral Associations
User.hasMany(Referral, { foreignKey: 'referrerId', as: 'referredUsers' });
Referral.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });

User.hasMany(Referral, { foreignKey: 'referredId', as: 'referredBy' });
Referral.belongsTo(User, { foreignKey: 'referredId', as: 'referred' });

// 13. ServiceArea & Franchise
Franchise.hasMany(ServiceArea, { foreignKey: 'franchiseId', as: 'serviceAreas' });
ServiceArea.belongsTo(Franchise, { foreignKey: 'franchiseId', as: 'franchise' });

// 14. SupportTicket Associations
User.hasMany(SupportTicket, { foreignKey: 'userId', as: 'supportTickets' });
SupportTicket.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 15. Notification Associations
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Sync database helper
const syncDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ force });
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect or sync database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Address,
  Category,
  Product,
  ProductVariant,
  ProductImage,
  Inventory,
  Cart,
  Order,
  OrderItem,
  Payment,
  Subscription,
  Wallet,
  WalletTransaction,
  Referral,
  ServiceArea,
  Franchise,
  Delivery,
  SupportTicket,
  Notification,
  syncDatabase
};
