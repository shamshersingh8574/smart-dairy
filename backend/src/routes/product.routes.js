const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.get('/categories', productController.getCategories);
router.post('/categories', protect, restrictTo('admin'), productController.createCategory);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', protect, restrictTo('admin'), productController.createProduct);

router.post('/:productId/variants', protect, restrictTo('admin'), productController.createVariant);
router.post('/variants/:variantId/images', protect, restrictTo('admin'), productController.addVariantImage);

module.exports = router;
