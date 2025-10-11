import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middlewares.js';

const router = Router();


router.get('/products', userController.getProducts);
router.get('/product/:productId', userController.getProductsById);
router.get('/categories', userController.getCategories);
router.post('/create-order', userController.createOrderSummaryHandler);
router.route('/order-summary/:id')
.get(userController.getOrderSummaryById)
.put(userController.updateOrderSummaryByIdHandler)
.delete(userController.deleteOrderSummaryByIdHandler)

router.get('/order-list/:userId', userController.getOrdersByUserId);

router.get('/user/:userId', userController.getUserById);

router.post('/warranty', userController.createWarranty);

router.get('/warranties', userController.getAllWarranties);

router.get('/warranties/:id', userController.getWarrantyById);
router.get('/coupons', userController.getCoupon);
router.get('/blogs', userController.getBlog);
router.get('/about-us', userController.getAboutUsPage);
router.get('/about-us/:id', userController.getAboutUsPage);


// router.use(authMiddleware.authenticateUser);
//wishlist

router.post('/addWishlist',userController.createWishlist)
router.put('/deleteWishlistProduct',userController.deleteWishlistProduct)
router.route('/wishlist/:userId')
  .get(userController.getWishlist)
  .delete(userController.deleteWishlist)


router.route('/review')
.post(userController.createFeedback)
.get(userController.getFeedbacks);

router.route('/review/:id')
.put(userController.updateFeedback)
.delete(userController.deleteFeedback);




// ShippingAddress

router.post('/addShippingAddress/:userId',userController.addShippingAddress)
router.patch('/updatePrimaryAddress/:userId/:addressId',userController.updatePrimaryAddress)
router.put('/updateAddress/:userId/:addressId',userController.updateShippingAddress)
router.delete('/deleteAddress/:userId/:addressId',userController.deleteShippingAddress)
router.get('/getUserAddress/:userId',userController.getUserAddressById)

router.route('/contact-us')
.post(userController.createContact)
.get(userController.getContacts);

router.get('/contact-us/:id', userController.getContact);


export default router;