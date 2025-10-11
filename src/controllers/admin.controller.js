import { diskStorage } from "multer";
import adminService from "../services/admin.service.js";
import { generateSuccessMessage, sendSuccessResponse } from "../utils/ApiMessage.js";
import catchAsync from "../utils/catchAsync.js";
import httpStatus from "http-status"


const createOurServices  = catchAsync(async (req, res) => {
    const services = await adminService.createOurServices(req.body);
    sendSuccessResponse(res, 'post', services)  
});

const getOurServices  = catchAsync(async (req, res) => {
    const services = await adminService.getOurServices(req.body);
    sendSuccessResponse(res, 'get', services)
});

const updateOurServices = catchAsync(async (req, res) => {
    const services = await adminService.getOurServices(req.params.id, req.body);
    sendSuccessResponse(res, 'put', services)
  });

const deleteOurService = catchAsync(async (req, res) => {
    const services = await adminService.deleteOurService(req.params.id);
    sendSuccessResponse(res, 'delete', services)
  });

const createAboutUsMainPage  = catchAsync(async (req, res) => {
    const AboutUsMainPage = await adminService.createAboutUsMainPage(req.body);
    sendSuccessResponse(res, 'post', AboutUsMainPage)
  });

const getAboutUsMainPage  = catchAsync(async (req, res) => {
    const AboutUsMainPage = await adminService.getAboutUsMainPage(req.body);
    sendSuccessResponse(res, 'get', AboutUsMainPage)
  });

const updateAboutUsMainPage  = catchAsync(async (req, res) => {
    const AboutUsMainPage = await adminService.updateAboutUsMainPage(req.params.id, req.body);
    sendSuccessResponse(res, 'put', AboutUsMainPage)
  });

const deleteAboutUsMainPage   = catchAsync(async (req, res) => {
    const category = await adminService.deleteAboutUsMainPage(req.params.id);
    sendSuccessResponse(res, 'delete', AboutUsMainPage)
  });

const createCategory  = catchAsync(async (req, res) => {
    const category = await adminService.createCategory(req.body);
    res.status(httpStatus.CREATED).send({ category });
  });

const getCategories   = catchAsync(async (req, res) => {
    const category = await adminService.getCategories(req.body);
    res.status(httpStatus.OK).send({ category });
  });

const updateCategory  = catchAsync(async (req, res) => {
    const category = await adminService.updateCategory(req.params.id, req.body);
    res.status(httpStatus.OK).send({ category });
  });

const deleteCategory   = catchAsync(async (req, res) => {
    const category = await adminService.deleteCategory(req.params.id);
    res.status(httpStatus.OK).send({ category });
  });

const createSubCategory  = catchAsync(async (req, res) => {
    const category = await adminService.createSubCategory(req.body);
    res.status(httpStatus.CREATED).send({ category });
  });

const getSubCategories   = catchAsync(async (req, res) => {
    const category = await adminService.getSubCategories(req.body);
    res.status(httpStatus.OK).send({ category });
  });

const getSubCategoryByCategoryId = catchAsync(async (req, res) => {
  const category = await adminService.getSubCategoryByCategoryId(req.params.id, req.body);
  res.status(httpStatus.OK).send({ category });
});

const updateSubCategory  = catchAsync(async (req, res) => {
    const category = await adminService.updateSubCategory(req.params.id, req.body);
    res.status(httpStatus.OK).send({ category });
  });

const deleteSubCategory   = catchAsync(async (req, res) => {
    const category = await adminService.deleteSubCategory(req.params.id);
    res.status(httpStatus.OK).send({ category , Message:"Delete SuccessFully...!"});
  });

const createProduct  = catchAsync(async (req, res) => {
    const product = await adminService.createProduct(req.body);
    res.status(httpStatus.CREATED).send({ product });
  });

const getProducts  = catchAsync(async (req, res) => {
    const product = await adminService.getProducts(req.query);
    res.status(httpStatus.OK).send({ product });
  });

const updateProduct = catchAsync(async (req, res) => {
    const product = await adminService.updateProduct(req.params.id, req.body);
    res.status(httpStatus.OK).send({ product });
  });

const deleteProduct = catchAsync(async (req, res) => {
    const product = await adminService.deleteProduct(req.params.id);
    res.status(httpStatus.OK).send({ product});
  });

const getProductsByCategoryId = catchAsync(async (req, res) => {
    const product = await adminService.getProductsByCategoryId(req.params.id);
    res.status(httpStatus.OK).send({ product });
  });

// const getRelatedProduct = catchAsync(async (req, res) => {
//   const {productId} = req.params;
//   const {product, relatedProducts} = await adminService.getRelatedProduct(productId);
//   res.status(httpStatus.OK).send({ product, relatedProducts });
// });

const getFeaturedProducts = catchAsync(async (req, res) => {
  const products = await adminService.getFeaturedProducts(); 
  res.status(httpStatus.OK).send({
      success: true,
      message: 'Featured products fetched successfully',
      data: products
  });
});

const createCoreValues = catchAsync(async (req, res) => {
  const coreValues = await adminService.createCoreValues(req.body);
  sendSuccessResponse(res, 'post', coreValues)
});

const getCoreValues = catchAsync(async (req, res) => {
  const coreValues = await adminService.getCoreValues(req.body);
  sendSuccessResponse(res, 'get', coreValues)
})

const updateCoreValues = catchAsync(async (req, res) => {
  const coreValues = await adminService.updateCoreValues(req.params.id, req.body);
  sendSuccessResponse(res, 'put', coreValues)
});

const deleteCoreValues = catchAsync(async (req, res) => {
  const coreValues = await adminService.deleteCoreValues(req.params.id);
  sendSuccessResponse(res, 'delete', coreValues)
});

const getOrderList = catchAsync(async (req, res) => {
  const {status} = req.query
  const orderList = await adminService.getOrderList(status);
  res.status(httpStatus.OK).send({ orderList });
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await adminService.getOrderById(req.params.id);
  res.status(httpStatus.OK).send({ order });
})

const createVisionAndMission = catchAsync(async (req, res) => {
  const visionAndMission = await adminService.createVisionAndMission(req.body);
  sendSuccessResponse(res, 'post', visionAndMission)
});

const getVisionAndMission = catchAsync(async (req, res) => {
  const visionAndMission = await adminService.getVisionAndMission(req.body);
  sendSuccessResponse(res, 'get', visionAndMission)
})

const updateVisionAndMission = catchAsync(async (req, res) => {
  const visionAndMission = await adminService.updateVisionAndMission(req.params.id, req.body);
  sendSuccessResponse(res, 'put', visionAndMission)
});

const deleteVisionAndMission = catchAsync(async (req, res) => {
  const visionAndMission = await adminService.deleteVisionAndMission(req.params.id);
  sendSuccessResponse(res, 'delete', visionAndMission)
});

const createWhyChooseUs = catchAsync(async (req, res) => {
  const chooseUsData = await adminService.createWhyChooseUs(req.body);
  sendSuccessResponse(res, 'post', chooseUsData)
});

const getWhyChooseUs = catchAsync(async (req, res) => {
  const chooseUsData = await adminService.getWhyChooseUs(req.body);
  sendSuccessResponse(res, 'get', chooseUsData)
})

const updateWhyChooseUs = catchAsync(async (req, res) => {
  const chooseUsData = await adminService.updateWhyChooseUs(req.params.id, req.body);
  sendSuccessResponse(res, 'put', chooseUsData)
});

const deleteWhyChooseUs = catchAsync(async (req, res) => {
  const chooseUsData = await adminService.deleteWhyChooseUs(req.params.id);
  sendSuccessResponse(res, 'delete', chooseUsData)
});


const createFaq = catchAsync(async (req, res) => {
  const faq = await adminService.createFaq(req.body);
  sendSuccessResponse(res, 'get', faq)
});

const getFaqs = catchAsync(async (req, res) => {
  const faqs = await adminService.getFaqs(req.body);
  sendSuccessResponse(res, 'get', faqs)
});

const updateFaq = catchAsync(async (req, res) => {
  const faq = await adminService.updateFaq(req.params.id, req.body);
  sendSuccessResponse(res, 'put', faq)
});

const deleteFaq = catchAsync(async (req, res) => {
  const faq = await adminService.deleteFaq(req.params.id);
  sendSuccessResponse(res, 'delete', faq)
});

const createFeedback  = catchAsync(async (req, res) => {
  const testimonial = await adminService.createFeedback(req.body);
  sendSuccessResponse(res, 'post', testimonial)
});

const getFeedbacks  = catchAsync(async (req, res) => {
  const testimonial = await adminService.getFeedbacks(req.body);
  sendSuccessResponse(res, 'get', testimonial)
});

const updateFeedback = catchAsync(async (req, res) => {
  const testimonial = await adminService.updateFeedback(req.params.id, req.body);
  sendSuccessResponse(res, 'put', testimonial)
});

const deleteFeedback = catchAsync(async (req, res) => {
  const testimonial = await adminService.deleteFeedback(req.params.id);
  sendSuccessResponse(res, 'delete', testimonial)
});

const createTeam  = catchAsync(async (req, res) => {
  const team = await adminService.createTeam(req.body);
  sendSuccessResponse(res, 'post', team)
});

const getTeam  = catchAsync(async (req, res) => {
  const team = await adminService.getTeam(req.body);
  sendSuccessResponse(res, 'get', team)
});

const getTeamById  = catchAsync(async (req, res) => {
  const team = await adminService.getTeamById(req.params.id);
  sendSuccessResponse(res, 'get', team)
});

const updateTeam = catchAsync(async (req, res) => {
  const team = await adminService.updateTeam(req.params.id, req.body);
  sendSuccessResponse(res, 'put', team)
});

const deleteTeam = catchAsync(async (req, res) => {
  const team = await adminService.deleteTeam(req.params.id);
  sendSuccessResponse(res, 'delete', team)
});

const createCompanyInfo = catchAsync(async (req, res) => {
  const infoData = await adminService.createCompanyInfo(req.body);
  sendSuccessResponse(res, 'post', infoData)
});

const getCompanyInfo = catchAsync(async (req, res) => {
  const infoData = await adminService.getCompanyInfo(req.body);
  sendSuccessResponse(res, 'get', infoData)
})

const updateCompanyInfo = catchAsync(async (req, res) => {
  const infoData = await adminService.updateCompanyInfo(req.params.id, req.body);
  sendSuccessResponse(res, 'put', infoData)
});

const deleteCompanyInfo = catchAsync(async (req, res) => {
  const infoData = await adminService.deleteCompanyInfo(req.params.id);
  sendSuccessResponse(res, 'delete', deleteCompanyInfo)
});



const addAboutUsPage = catchAsync(async (req, res) => {
  const AboutUs = await adminService.createAboutUsPage(req.body);
  res.status(httpStatus.CREATED).send({ AboutUs });
});

const getAboutUsPage = catchAsync(async (req, res) => {
  const AboutUs = await adminService.getAboutUsPage(req.body);
  res.status(httpStatus.OK).send({ AboutUs });
});
const getAboutUsById = catchAsync(async (req, res) => {
  const AboutUs = await adminService.getAboutUsById(req.params.id);
  res.status(httpStatus.OK).send({ AboutUs });
});

const updateAboutUsPage = catchAsync(async (req, res) => {
  const AboutUs = await adminService.updateAboutUsPage(req.params.id, req.body);
  res.status(httpStatus.OK).send({ AboutUs });
});

const deleteAboutUsPage = catchAsync(async (req, res) => {
  const AboutUs = await adminService.deleteAboutUsPage(req.params.id);
  res.status(httpStatus.OK).send({ AboutUs });
});


const addBlog = catchAsync(async (req, res) => {
  const blog = await adminService.createBlog(req.body);
  res.status(httpStatus.CREATED).send({ blog });
});

const getBlog = catchAsync(async (req, res) => {
  const blog = await adminService.getBlog(req.body);
  res.status(httpStatus.OK).send({ blog });
});

const updateBlog = catchAsync(async (req, res) => {
  const blog = await adminService.updateBlog(req.params.id, req.body);
  res.status(httpStatus.OK).send({ blog });
});

const deleteBlog = catchAsync(async (req, res) => {
  const blog = await adminService.deleteBlog(req.params.id);
  res.status(httpStatus.OK).send({ blog });
});

const createWhatWeOffer = catchAsync(async (req, res) => {
  const WhatWeOffer = await adminService.createWhatWeOffer(req.body);
  sendSuccessResponse(res, 'post', WhatWeOffer)
});

const getWhatWeOffer = catchAsync(async (req, res) => {
  const WhatWeOffer = await adminService.getWhatWeOffer(req.body);
  sendSuccessResponse(res, 'get', WhatWeOffer)
});

const updateWhatWeOffer = catchAsync(async (req, res) => {
  const WhatWeOffer = await adminService.updateWhatWeOffer(req.params.id, req.body);
  sendSuccessResponse(res, 'put', WhatWeOffer)
});

const deleteWhatWeOffer = catchAsync(async (req, res) => {
  const WhatWeOffer = await adminService.deleteWhatWeOffer(req.params.id);
  sendSuccessResponse(res, 'delete', WhatWeOffer)
});

const createVision = catchAsync(async (req, res) => {
  const vision = await adminService.createVision(req.body);
  sendSuccessResponse(res, 'post', vision)
});

const getVision = catchAsync(async (req, res) => {
  const vision = await adminService.getVision(req.body);
  sendSuccessResponse(res, 'get', vision)
});

const updateVision = catchAsync(async (req, res) => {
  const vision = await adminService.updateVision(req.params.id, req.body);
  sendSuccessResponse(res, 'put', vision)
});

const deleteVision = catchAsync(async (req, res) => {
  const vision = await adminService.deleteVision(req.params.id);
  sendSuccessResponse(res, 'delete', vision)
});

const createMission = catchAsync(async (req, res) => {
  const mission = await adminService.createMission(req.body);
  sendSuccessResponse(res, 'post', mission)
});

const getMission = catchAsync(async (req, res) => {
  const mission = await adminService.getMission(req.body);
  sendSuccessResponse(res, 'get', mission)
});

const updateMission = catchAsync(async (req, res) => {
  const mission = await adminService.updateMission(req.params.id, req.body);
  sendSuccessResponse(res, 'put', mission)
});

const deleteMission = catchAsync(async (req, res) => {
  const mission = await adminService.deleteMission(req.params.id);
  sendSuccessResponse(res, 'delete', mission)
});

const createCoreValuesMain = catchAsync(async (req, res) => {
  const coreValuesMain = await adminService.createCoreValuesMain(req.body);
  sendSuccessResponse(res, 'post', coreValuesMain)
});

const getCoreValuesMain  = catchAsync(async (req, res) => {
  const coreValuesMain = await adminService.getCoreValuesMain (req.body);
  sendSuccessResponse(res, 'get', coreValuesMain)
});

const updateCoreValuesMain = catchAsync(async (req, res) => {
  const coreValuesMain = await adminService.updateCoreValuesMain(req.params.id, req.body);
  sendSuccessResponse(res, 'put', coreValuesMain)
});

const deleteCoreValuesMain = catchAsync(async (req, res) => {
  const coreValuesMain = await adminService.deleteCoreValuesMain(req.params.id);
  sendSuccessResponse(res, 'delete', coreValuesMain)
});

const addHeroImage = catchAsync(async (req, res) => {
  const heroImage = await adminService.createBanner(req.body);
  sendSuccessResponse(res, 'create', heroImage);
});

const getHeroImage  = catchAsync(async (req, res) => {
  const heroImage = await adminService.getBanner (req.body);
  sendSuccessResponse(res, 'get', heroImage)
});

const updateHeroImage = catchAsync(async (req, res) => {
  const heroImage = await adminService.updateBanner(req.params.id, req.body);
  sendSuccessResponse(res, 'update', heroImage)
});

const deleteHeroImage = catchAsync(async (req, res) => {
  const heroImage = await adminService.deleteBanner(req.params.id);
  sendSuccessResponse(res, 'delete', heroImage)
});

const getContacts = async (req, res) => {
  try {
    const contacts = await adminService.getAllContacts();
    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};



export default {createCategory,getCategories,updateCategory,deleteCategory,createSubCategory,getSubCategories,getSubCategoryByCategoryId,updateSubCategory,deleteSubCategory,
  createProduct,getProducts,updateProduct,deleteProduct,getProductsByCategoryId, getFeaturedProducts, createAboutUsMainPage,updateAboutUsMainPage,deleteAboutUsMainPage,getAboutUsMainPage,
createCoreValues, getCoreValues, updateCoreValues, deleteCoreValues,deleteOurService, updateOurServices,getOurServices,createOurServices,getOrderList,
getOrderById, createVisionAndMission, getVisionAndMission, updateVisionAndMission, deleteVisionAndMission, createWhyChooseUs, getWhyChooseUs, updateWhyChooseUs, deleteWhyChooseUs,
createFaq, getFaqs, updateFaq, deleteFaq, createFeedback, getFeedbacks, updateFeedback, deleteFeedback, createTeam, getTeam, getTeamById, updateTeam, deleteTeam,
createCompanyInfo, getCompanyInfo, updateCompanyInfo, deleteCompanyInfo, addAboutUsPage, getAboutUsPage, getAboutUsById, updateAboutUsPage, deleteAboutUsPage,
addBlog, getBlog, updateBlog, deleteBlog, createWhatWeOffer, getWhatWeOffer, updateWhatWeOffer, deleteWhatWeOffer, createVision, getVision, updateVision, deleteVision, getContacts,
createMission, getMission, updateMission, deleteMission, createCoreValuesMain, getCoreValuesMain, updateCoreValuesMain, deleteCoreValuesMain, addHeroImage, getHeroImage, deleteHeroImage, updateHeroImage,
}
