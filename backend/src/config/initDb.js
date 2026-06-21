const mysql = require('mysql2/promise');
const sequelize = require('./database');
const {
  User,
  Wallet,
  Category,
  Product,
  ProductVariant,
  Inventory,
  Franchise,
  ServiceArea
} = require('../models');
require('dotenv').config();

const initDb = async () => {
  const connectionString = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 3306
  };

  const dbName = process.env.DB_NAME || 'dairy_farm_db';

  console.log(`Connecting to MySQL server at ${connectionString.host}:${connectionString.port}...`);
  
  try {
    // 1. Create database if it doesn't exist
    const connection = await mysql.createConnection(connectionString);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    console.log(`Database '${dbName}' verified/created.`);

    // 2. Authenticate and sync Sequelize models
    await sequelize.authenticate();
    console.log('Database connection authenticated.');
    
    // Force sync database to create fresh tables (safe for practicing/testing)
    await sequelize.sync({ force: true });
    console.log('All database tables synchronized successfully.');

    // 3. Seed Initial Data
    console.log('Seeding database with default data...');

    // a. Users (Admin, Franchise, Delivery, Customer)
    const admin = await User.create({
      name: 'Dairy Admin',
      email: 'admin@dairyfarm.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999'
    });

    const franchiseOwner = await User.create({
      name: 'Shimla Dairy Franchise',
      email: 'franchise@dairyfarm.com',
      password: 'franchise123',
      role: 'franchise',
      phone: '8888888888'
    });

    const deliveryAgent = await User.create({
      name: 'Ramesh Delivery',
      email: 'delivery@dairyfarm.com',
      password: 'delivery123',
      role: 'delivery',
      phone: '7777777777'
    });

    const customer = await User.create({
      name: 'Suresh Kumar',
      email: 'customer@dairyfarm.com',
      password: 'customer123',
      role: 'customer',
      phone: '6666666666'
    });

    console.log('Users seeded.');

    // b. Create Wallets for users
    await Wallet.create({ userId: admin.id, balance: 0 });
    await Wallet.create({ userId: franchiseOwner.id, balance: 0 });
    await Wallet.create({ userId: deliveryAgent.id, balance: 0 });
    
    // Seed customer wallet with ₹1000
    await Wallet.create({ userId: customer.id, balance: 1000.00 });
    console.log('Wallets initialized.');

    // c. Franchise
    const franchise = await Franchise.create({
      ownerId: franchiseOwner.id,
      name: 'City Center Dairy Franchise',
      location: '123 Main Street, Sector 4, Metro City',
      commissionRate: 12.50
    });
    console.log('Franchise created.');

    // d. Service Areas for Franchise
    await ServiceArea.create({
      pincode: '110001',
      areaName: 'Connaught Place',
      franchiseId: franchise.id,
      deliveryCharge: 20.00
    });
    await ServiceArea.create({
      pincode: '400001',
      areaName: 'Fort Mumbai',
      franchiseId: franchise.id,
      deliveryCharge: 30.00
    });
    await ServiceArea.create({
      pincode: '560001',
      areaName: 'MG Road Bangalore',
      franchiseId: franchise.id,
      deliveryCharge: 15.00
    });
    console.log('Service areas seeded.');

    // e. Categories
    const catMilk = await Category.create({ name: 'Milk', description: 'Fresh, pure milk sourced directly from local organic farms daily.' });
    const catGhee = await Category.create({ name: 'Ghee', description: 'Traditional clarified butter made from cow and buffalo milk.' });
    const catPaneer = await Category.create({ name: 'Paneer & Cheese', description: 'Rich, soft paneer and authentic dairy cheese.' });
    const catButter = await Category.create({ name: 'Butter', description: 'Freshly churned salted and unsalted butter.' });
    console.log('Categories seeded.');

    // f. Products & Variants & Inventory Stock
    // 1. Fresh Cow Milk
    const prodCowMilk = await Product.create({
      categoryId: catMilk.id,
      name: 'Fresh Cow Milk',
      description: 'Pasteurized homogenized pure cow milk with optimum fat content.'
    });
    const varCowMilk500 = await ProductVariant.create({
      productId: prodCowMilk.id,
      sku: 'MILK-COW-500ML',
      volumeWeight: '500ml',
      price: 32.00,
      discountPrice: 30.00
    });
    const varCowMilk1L = await ProductVariant.create({
      productId: prodCowMilk.id,
      sku: 'MILK-COW-1L',
      volumeWeight: '1L',
      price: 60.00,
      discountPrice: 58.00
    });

    // 2. Pure Cow Ghee
    const prodGhee = await Product.create({
      categoryId: catGhee.id,
      name: 'Pure Cow Ghee',
      description: 'Aromatic granular cow ghee prepared using traditional bilona method.'
    });
    const varGhee500 = await ProductVariant.create({
      productId: prodGhee.id,
      sku: 'GHEE-COW-500ML',
      volumeWeight: '500ml',
      price: 380.00,
      discountPrice: 350.00
    });
    const varGhee1L = await ProductVariant.create({
      productId: prodGhee.id,
      sku: 'GHEE-COW-1L',
      volumeWeight: '1L',
      price: 720.00,
      discountPrice: 680.00
    });

    // 3. Fresh Paneer
    const prodPaneer = await Product.create({
      categoryId: catPaneer.id,
      name: 'Fresh Organic Paneer',
      description: 'Soft, hygienic, and vacuum-packed paneer made from fresh whole milk.'
    });
    const varPaneer200 = await ProductVariant.create({
      productId: prodPaneer.id,
      sku: 'PANEER-200G',
      volumeWeight: '200g',
      price: 90.00,
      discountPrice: 85.00
    });

    console.log('Products & variants seeded.');

    // g. Inventory Stock Counts
    await Inventory.create({ variantId: varCowMilk500.id, franchiseId: franchise.id, stockCount: 150, lowStockThreshold: 20 });
    await Inventory.create({ variantId: varCowMilk1L.id, franchiseId: franchise.id, stockCount: 100, lowStockThreshold: 15 });
    await Inventory.create({ variantId: varGhee500.id, franchiseId: franchise.id, stockCount: 50, lowStockThreshold: 5 });
    await Inventory.create({ variantId: varGhee1L.id, franchiseId: franchise.id, stockCount: 30, lowStockThreshold: 5 });
    await Inventory.create({ variantId: varPaneer200.id, franchiseId: franchise.id, stockCount: 75, lowStockThreshold: 10 });
    
    console.log('Inventory stock seeded.');
    console.log('Database initialization and seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  initDb();
}

module.exports = initDb;
