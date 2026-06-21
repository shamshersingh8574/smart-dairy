const { Category, Product, ProductVariant, ProductImage, Inventory, Franchise } = require('../models');

const getCategories = async () => {
  return await Category.findAll({ where: { status: 'active' } });
};

const createCategory = async ({ name, description, imageUrl }) => {
  return await Category.create({ name, description, imageUrl });
};

const getProducts = async (categoryId = null) => {
  const filter = { status: 'active' };
  if (categoryId) {
    filter.categoryId = categoryId;
  }

  return await Product.findAll({
    where: filter,
    include: [
      { model: Category, as: 'category' },
      {
        model: ProductVariant,
        as: 'variants',
        include: [{ model: ProductImage, as: 'images' }]
      }
    ]
  });
};

const getProductById = async (id) => {
  const product = await Product.findOne({
    where: { id, status: 'active' },
    include: [
      { model: Category, as: 'category' },
      {
        model: ProductVariant,
        as: 'variants',
        include: [
          { model: ProductImage, as: 'images' },
          { model: Inventory, as: 'inventories', include: [{ model: Franchise, as: 'franchise' }] }
        ]
      }
    ]
  });

  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

const createProduct = async ({ categoryId, name, description }) => {
  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  return await Product.create({ categoryId, name, description });
};

const createVariant = async (productId, { sku, volumeWeight, price, discountPrice, stockCount, franchiseId }) => {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const variant = await ProductVariant.create({
    productId,
    sku,
    volumeWeight,
    price,
    discountPrice
  });

  // Initialize inventory stock count
  await Inventory.create({
    variantId: variant.id,
    franchiseId: franchiseId || null, // Null is main warehouse stock
    stockCount: stockCount || 0,
    lowStockThreshold: 10
  });

  return variant;
};

const addVariantImage = async (variantId, { imageUrl, isPrimary }) => {
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) {
    throw new Error('Product variant not found');
  }

  if (isPrimary) {
    // Reset other primary images
    await ProductImage.update({ isPrimary: false }, { where: { variantId } });
  }

  return await ProductImage.create({
    variantId,
    imageUrl,
    isPrimary: isPrimary || false
  });
};

module.exports = {
  getCategories,
  createCategory,
  getProducts,
  getProductById,
  createProduct,
  createVariant,
  addVariantImage
};
