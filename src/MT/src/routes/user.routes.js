import { Router } from 'express';
import userController from '../controllers/user.controller.js';


const router = Router();


router.get('/products', userController.getProducts);
router.get('/product/:productId', userController.getProductsById);
router.get('/categories', userController.getCategories);
router.route('/order-summary/:id')
.get(userController.getOrderSummaryById)
.put(userController.updateOrderSummaryByIdHandler)
.delete(userController.deleteOrderSummaryByIdHandler)

router.get('/order-list/:userId', userController.getOrdersByUserId);

router.get('/user/:userId', userController.getUserById);

//cart

router.post('/warranty', userController.createWarranty);

router.get('/warranties', userController.getAllWarranties);

router.get('/warranties/:userId', userController.getWarrantiesByUserId);
router.get('/coupons', userController.getCoupon);
router.get('/blogs', userController.getBlog);

// ShippingAddress

router.post('/addShippingAddress/:userId',userController.addShippingAddress)
router.patch('/updatePrimaryAddress/:userId/:addressId',userController.updatePrimaryAddress)
router.put('/updateAddress/:userId/:addressId',userController.updateShippingAddress)
router.delete('/deleteAddress/:userId/:addressId',userController.deleteShippingAddress)
router.get('/getUserAddress/:userId',userController.getUserAddressById)

// Order 

// specific order
router.put('/order-status/:userId/:orderId',userController.orderStatusChange)

//Order Receipt

router.get('/getOrderReceipt/:userId/:orderId',userController.getOrderReceipt)

export default router;