const productService = require('../services/product.service');

const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await productService.createCategory(req.body);
    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const products = await productService.getProducts(categoryId);
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const variant = await productService.createVariant(productId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Product variant created successfully',
      data: variant
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const addVariantImage = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const image = await productService.addVariantImage(variantId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Image added to variant successfully',
      data: image
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
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
