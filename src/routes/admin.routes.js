import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import  {validate}  from '../middlewares/validation.middlewares.js';
import productValidation from '../validations/product.validation.js';
import multer from 'multer';

const router = Router() ;
const upload = multer({ dest: 'uploads/' });

router.get('/categories', adminController.getCategories);
router.get('/products', adminController.getProducts);
router.get('/product/:id', adminController.getProductsByCategoryId);

// router.use(authMiddleware.authenticateAdmin);

router.route('/category')
  .post(validate(productValidation.createCategorySchema),adminController.createCategory);

router.route('/category/:id')
  .put(validate(productValidation.updateCategorySchema),adminController.updateCategory)
  .delete(adminController.deleteCategory);

router.route('/our-service')
  .post(adminController.createOurServices)
  .get(adminController.getOurServices);

router.route('/our-service/:id')
  .put(adminController.updateOurServices)
  .delete(adminController.deleteOurService);

router.route('/about-us-page')
  .post(adminController.createAboutUsMainPage)
  .get(adminController.getAboutUsMainPage);

router.route('/about-us-page/:id')
  .put(adminController.updateAboutUsMainPage)
  .delete(adminController.deleteAboutUsMainPage);

router.route('/product')
  .post(adminController.createProduct);

  router.route('/product/:id')
  .put(adminController.updateProduct)
  .delete(adminController.deleteProduct);
  
router.route('/testimonial')
.post(adminController.createFeedback)
.get(adminController.getFeedbacks);

router.route('/testimonial/:id')
.put(adminController.updateFeedback)
.delete(adminController.deleteFeedback);

router.route('/core-values')
.post(adminController.createCoreValues)
.get(adminController.getCoreValues);

router.route('/core-values/:id')
.put(adminController.updateCoreValues)
.delete(adminController.deleteCoreValues);

router.route('/vision-mission')
.post(adminController.createVisionAndMission)
.get(adminController.getVisionAndMission);

router.route('/vision-mission/:id')
.put(adminController.updateVisionAndMission)
.delete(adminController.deleteVisionAndMission);

router.route('/faq')
.post(adminController.createFaq)
.get(adminController.getFaqs);

router.route('/faq/:id')
.put(adminController.updateFaq)
.delete(adminController.deleteFaq);

router.route('/team')
.post(adminController.createTeam)
.get(adminController.getTeam);

router.route('/team/:id')
.get(adminController.getTeamById)
.put(adminController.updateTeam)
.delete(adminController.deleteTeam);

router.route('/company-info')
.post(adminController.createCompanyInfo)
.get(adminController.getCompanyInfo);

router.route('/company-info/:id')
.put(adminController.updateCompanyInfo)
.delete(adminController.deleteCompanyInfo);

router.route('/about-us')
.post(adminController.addAboutUsPage)
.get(adminController.getAboutUsPage);

router.route('/about-us/:id')
.put(adminController.updateAboutUsPage)
.get(adminController.getAboutUsById)
.delete(adminController.deleteAboutUsPage);

router.route('/blog')
.post(adminController.addBlog)
.get(adminController.getBlog);

router.route('/blog/:id')
.put(adminController.updateBlog)
.delete(adminController.deleteBlog);

router.route('/what-we-offer')
.post(adminController.createWhatWeOffer)
.get(adminController.getWhatWeOffer);

router.route('/what-we-offer/:id')
.put(adminController.updateWhatWeOffer)
.delete(adminController.deleteWhatWeOffer);

router.route('/why-choose-us')
.post(adminController.createWhyChooseUs)
.get(adminController.getWhyChooseUs);

router.route('/why-choose-us/:id')
.put(adminController.updateWhyChooseUs)
.delete(adminController.deleteWhyChooseUs);

router.route('/vision')
.post(adminController.createVision)
.get(adminController.getVision);

router.route('/vision/:id')
.put(adminController.updateVision)
.delete(adminController.deleteVision);

router.route('/mission')
.post(adminController.createMission)
.get(adminController.getMission);

router.route('/mission/:id')
.put(adminController.updateMission)
.delete(adminController.deleteMission);

router.route('/core-values-main')
.post(adminController.createCoreValuesMain)
.get(adminController.getCoreValuesMain);

router.route('/core-values-main/:id')
.put(adminController.updateCoreValuesMain)
.delete(adminController.deleteCoreValuesMain);

router.route('/hero-image')
.post(adminController.addHeroImage)
.get(adminController.getHeroImage);

router.route('/hero-image/:id')
.put(adminController.updateHeroImage)
.delete(adminController.deleteHeroImage);

router.get('/contact-us', adminController.getContacts);

export default router;
