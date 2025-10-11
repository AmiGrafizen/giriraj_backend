import Category from "../models/category.model.js"  
import { ApiError } from "../utils/ApiError.js";
import Product from "../models/product.model.js"
import httpStatus, { status } from "http-status"
import { AboutUs } from "../models/aboutUs.model.js";
import { Blog } from "../models/blog.model.js";
import Banner from "../models/coreValuesMain.model.js";
import { AboutUsPage } from "../models/aboutUsPage.model.js";
import OurServices from "../models/brand.model.js";
import Team from "../models/team.model.js";
import { Review } from "../models/review.model.js";
import faq from "../models/faq.model.js";
import HeroSection from "../models/heroSection.model.js";
import WhatWeOffer from "../models/WhatWeOffer.model.js";
import CoreValue from "../models/coreValues.model.js";
import VisionAndMission from "../models/vision-mission.model.js";
import CompanyInfo from "../models/info.model.js";
import WhyChooseUs from "../models/label.model.js";
import CoreValueMain from "../models/coreValuesMain.model.js";
import Mission from "../models/mission.model.js";
import Vision from "../models/vision.model.js";
import Contact from "../models/contactUs.model.js";


const createCategory = async (categoryData) => {
    if (!categoryData.name) throw new ApiError(httpStatus.BAD_REQUEST, 'name is required!');
    const existingCategory = await Category.findOne({name : categoryData?.name})
    if (existingCategory) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Category with name "${categoryData.name}" already exists.`);
  }
     return Category.create(categoryData);
   };

const getCategories = async () => {
     return  Category.find();
   };

const updateCategory = async (id, categoryData) => {
  const existingCategory = await Category.findOne({name : categoryData?.name})
  if (existingCategory) {
  throw new ApiError(httpStatus.BAD_REQUEST, `Category with name "${categoryData.name}" already exists.`);
}
  const updateData = await Category.findByIdAndUpdate(id,categoryData,{new:true});
  if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
     return updateData;
   };

const deleteCategory = async (id) => {
  const deleteId = await Category.findByIdAndDelete(id);
  if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
     return  deleteId;
   };

const createProduct = async (productData) => {
    return await Product.create(productData);
   };

   const getProducts = async (query) => {
    return Product.find();
  };

const updateProduct = async (id, productData) => {
 
  const updateData = await Product.findByIdAndUpdate(id,productData,{new:true});
  if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
     return updateData;
   };

   const deleteProduct = async (id) => {
    const deleteId = await Product.findByIdAndDelete(id);
    if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
       return  deleteId;
     };

 const getProductsByCategoryId = async (categoryId) => {
      const products = await Product.find({ categoryId }).populate('categoryId');
    
      if (!products || products.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No products found for this category');
      }
    
      return products;
    };


    const createAboutUsPage = async (aboutUsData) => {
      if (!aboutUsData.title) throw new ApiError(httpStatus.BAD_REQUEST, 'Title is required!');
      if (!aboutUsData.headDescription) throw new ApiError(httpStatus.BAD_REQUEST, 'HeadDescription is required!');
    
      if (!Array.isArray(aboutUsData.sections) || aboutUsData.sections.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'At least one section is required!');
      }
  
        for (const section of aboutUsData.sections) {
        if (!section.subTitle) throw new ApiError(httpStatus.BAD_REQUEST, 'subTitle is required for each section!');
        if (!section.description) throw new ApiError(httpStatus.BAD_REQUEST, 'description is required for each section!');
        if (!section.icon) throw new ApiError(httpStatus.BAD_REQUEST, 'icon is required for each section!');
      }
    
      const existingAboutUs = await AboutUs.findOne();
    
      if (existingAboutUs) {
        return AboutUs.findByIdAndUpdate(existingAboutUs._id, aboutUsData, {
          new: true,
          runValidators: true,
        });
      }
    
      return AboutUs.create(aboutUsData);
    };
    

const getAboutUsPage = async() => {
  return AboutUs.find();
};

const getAboutUsById = async(id) => {
    return AboutUs.findById(id);
};

const updateAboutUsPage = async (id, aboutUsData) => {
  const existingAboutUs = await AboutUs.findOne({title : aboutUsData?.title})
  if (existingAboutUs) {
  throw new ApiError(httpStatus.BAD_REQUEST, `About Us with title "${aboutUsData.title}" already exists.`);
}
const updateData = await AboutUs.findByIdAndUpdate(id,aboutUsData,{new:true});
  if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'About Us not found');
     return updateData;
};

const deleteAboutUsPage = async (id) => {
  const deleteId = await AboutUs.findByIdAndDelete(id);
  if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'About Us not found');
     return  deleteId;
   };

   const createAboutUsMainPage = async (aboutUsData) => {
    if (!aboutUsData.title) throw new ApiError(httpStatus.BAD_REQUEST, 'Title is required!');
    if (!aboutUsData.description) throw new ApiError(httpStatus.BAD_REQUEST, 'Description is required!');
  
    const existingAboutUs = await AboutUsPage.findOne();
  
    if (existingAboutUs) {
      return AboutUsPage.findByIdAndUpdate(existingAboutUs._id, aboutUsData, {
        new: true, 
        runValidators: true, 
      });
    }
  
    return AboutUsPage.create(aboutUsData);
  };
  
  
  const getAboutUsMainPage = async() => {
    return AboutUsPage.find();
  };
  
  const getAboutUsByIdMain = async(id) => {
      return AboutUsPage.findById(id);
  };
  
  const updateAboutUsMainPage = async (id, aboutUsData) => {
    const existingAboutUs = await AboutUsPage.findOne({title : aboutUsData?.title})
    if (existingAboutUs) {
    throw new ApiError(httpStatus.BAD_REQUEST, `About Us with title "${aboutUsData.title}" already exists.`);
  }
  const updateData = await AboutUsPage.findByIdAndUpdate(id,aboutUsData,{new:true});
    if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'About Us not found');
       return updateData;
  };
  
  const deleteAboutUsMainPage = async (id) => {
    const deleteId = await AboutUsPage.findByIdAndDelete(id);
    if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'About Us not found');
       return  deleteId;
     };

   const createBlog = async (blogData) => {
    return await Blog.create(blogData);
  };
  
  const getBlog = async() => {
    return Blog.find();
  };
  
  const updateBlog = async (id, blogData) => {
  const updateData = await Blog.findByIdAndUpdate(id,blogData,{new:true});
    if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
       return updateData;
  };
  
  const deleteBlog = async (id) => {
    const deleteId = await Blog.findByIdAndDelete(id);
    if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
       return  deleteId;
     };

     const createBanner = async (bannerData) => {
      if(!bannerData.image) throw new ApiError(httpStatus.BAD_REQUEST, 'Image is required!');
      return HeroSection.create(bannerData);
    };
    
    const getBanner = async() => {
      return HeroSection.find();
    };
    
    const updateBanner = async (id, bannerData) => {
    const updateData = await HeroSection.findByIdAndUpdate(id,bannerData,{new:true});
      if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
         return updateData;
    };
    
    const deleteBanner = async (id) => {
      const deleteId = await HeroSection.findByIdAndDelete(id);
      if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
         return  deleteId;
       };

       const createOurServices = async (serviceDate) => {
        if (!serviceDate.text) throw new ApiError(httpStatus.BAD_REQUEST, 'text is required!');

         return OurServices.create(serviceDate);
       };
    
    const getOurServices = async () => {
         return  OurServices.find();
       };
    
    const updateOurServices = async (id, serviceDate) => {
     
      const updateData = await OurServices.findByIdAndUpdate(id,serviceDate,{new:true});
      if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Services not found');
         return updateData;
       };
    
    const deleteOurService = async (id) => {
      const deleteId = await OurServices.findByIdAndDelete(id);
      if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Services not found');
         return  deleteId;
       };
  
       const createTeam = async (teamData) => {
        if (!teamData.name) throw new ApiError(httpStatus.BAD_REQUEST, 'Name is required!');
        if (!teamData.role) throw new ApiError(httpStatus.BAD_REQUEST, 'Role is required!');
        if (!teamData.image) throw new ApiError(httpStatus.BAD_REQUEST, 'Image is required!');
      
        return Team.create(teamData);
      };
      
      const getTeam = async () => {
        return Team.find();
      };
      
      const getTeamById = async (id) => {
        const team = await Team.findById(id);
        if (!team) throw new ApiError(httpStatus.NOT_FOUND, 'Team not found!');
      
        return team;
      };
      
      const updateTeam = async (id, teamData) => {
        const team = await Team.findByIdAndUpdate(id, teamData, { new: true });
          if (!team) throw new ApiError(httpStatus.NOT_FOUND, 'Team not found!');
          return team;
      };
      
      const deleteTeam = async (id) => {
        const deleteId = await Team.findByIdAndDelete(id);
        if(deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
        return deleteId;
      };

      const createFeedback = async (feedbackData) => {
        if(!feedbackData.name) throw new ApiError(httpStatus.BAD_REQUEST, 'Name is required!');
        if(!feedbackData.description) throw new ApiError(httpStatus.BAD_REQUEST, 'Description is required!')
      
          return Review.create(feedbackData);
      };


      const getFeedbacks = async () => {
        return Review.find();
      };
      
      const updateFeedback = async (id, feedbackData) => {
        const updateData = await Review.findByIdAndUpdate(id, feedbackData, {new: true});
        if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Data not found');
        return updateData;
      };
      
      const deleteFeedback = async (id) => {
        const deleteId =  await Review.findByIdAndDelete(id);
        if (deleteId === null ) throw ApiError(httpStatus.NOT_FOUND, 'Data not found');
        return deleteId;
      };

      const createFaq = async (attributeData) => {
        if (!attributeData.question) throw new ApiError(httpStatus.BAD_REQUEST, 'question is required!');
        if (!attributeData.answer) throw new ApiError(httpStatus.BAD_REQUEST, 'answer is required!');
        const existingCategory = await faq.findOne({question : attributeData?.question})
        if (existingCategory) {
        throw new ApiError(httpStatus.BAD_REQUEST, `FAQ with question "${attributeData.question}" already exists.`);
      }
      return faq.create(attributeData);
      
      };

      const getFaqs = async () => {
        return  faq.find();
      };
      
      const updateFaq = async (id, attributeData) => {
        const existingAttribute = await faq.findOne({question : attributeData?.question})
        if (existingAttribute) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Faq with question "${attributeData.question}" already exists.`);
      }
        const updateData = await faq.findByIdAndUpdate(id,attributeData,{new:true});
        if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Faq not found');
           return updateData;
         };
      
      
      const deleteFaq = async (id) => {
      const deleteId = await faq.findByIdAndDelete(id);
      if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Faq not found');
        return  deleteId;
      };

      const createWhatWeOffer = async (whatWeOfferData) => {
        if (!whatWeOfferData.title) throw new ApiError(httpStatus.BAD_REQUEST, 'Title is required!');
        if (!whatWeOfferData.description) throw new ApiError(httpStatus.BAD_REQUEST, 'Description is required!');
        if (!whatWeOfferData.image) throw new ApiError(httpStatus.BAD_REQUEST, 'Image is required!');
      
        return WhatWeOffer.create(whatWeOfferData);
      };
      
      const getWhatWeOffer = async () => {
        return WhatWeOffer.find();
      };
      
      const updateWhatWeOffer = async (id, whatWeOfferData) => {
        const team = await WhatWeOffer.findByIdAndUpdate(id, whatWeOfferData, { new: true });
          if (!team) throw new ApiError(httpStatus.NOT_FOUND, 'WhatWeOffer Data is not found!');
          return team;
      };
      
      const deleteWhatWeOffer = async (id) => {
        const deleteId = await WhatWeOffer.findByIdAndDelete(id);
        if(deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'WhatWeOffer Data is not found');
        return deleteId;
      };

      const createCoreValues = async (coreValueData) => {
        return await CoreValue.create(coreValueData);
       };
      
      const getCoreValues = async () => {
         return  CoreValue.find();
       };
      
      const updateCoreValues = async (id, coreValueData) => {
      const updateData = await CoreValue.findByIdAndUpdate(id,coreValueData,{new:true});
      if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Data not found');
         return updateData;
       };
      
      const deleteCoreValues = async (id) => {
      const deleteId = await CoreValue.findByIdAndDelete(id);
      if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Data not found');
         return  deleteId;
       };

       const createVisionAndMission = async (visionData) => {
        if (!visionData.title) throw new ApiError(httpStatus.BAD_REQUEST, 'title is required!');
         return VisionAndMission.create(visionData);
       };
      
      const getVisionAndMission = async () => {
         return  VisionAndMission.find();
       };
      
      const updateVisionAndMission = async (id, visionData) => {
      const updateData = await VisionAndMission.findByIdAndUpdate(id,visionData,{new:true});
      if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
         return updateData;
       };
      
      const deleteVisionAndMission = async (id) => {
      const deleteId = await VisionAndMission.findByIdAndDelete(id);
      if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
         return  deleteId;
       };

       const createCompanyInfo = async (chooseUsData) => {
        if (!chooseUsData.phoneNumber) throw new ApiError(httpStatus.BAD_REQUEST, 'phoneNumber is required!');
        if (!chooseUsData.email) throw new ApiError(httpStatus.BAD_REQUEST, 'email is required!');
        if (!chooseUsData.address) throw new ApiError(httpStatus.BAD_REQUEST, 'address is required!');
         return CompanyInfo.create(chooseUsData);
       };
      
      const getCompanyInfo = async () => {
         return  CompanyInfo.find();
       };
      
      const updateCompanyInfo = async (id, chooseUsData) => {
      const updateData = await CompanyInfo.findByIdAndUpdate(id,chooseUsData,{new:true});
      if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
         return updateData;
       };
      
      const deleteCompanyInfo = async (id) => {
      const deleteId = await CompanyInfo.findByIdAndDelete(id);
      if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
         return  deleteId;
       };

       const createWhyChooseUs = async (visionData) => {
        if (!visionData.title) throw new ApiError(httpStatus.BAD_REQUEST, 'title is required!');
        if (!visionData.text) throw new ApiError(httpStatus.BAD_REQUEST, 'text is required!');
        if (!visionData.headText) throw new ApiError(httpStatus.BAD_REQUEST, 'headText is required!');
         return WhyChooseUs.create(visionData);
       };
      
      const getWhyChooseUs = async () => {
         return  WhyChooseUs.find();
       };
      
      const updateWhyChooseUs = async (id, visionData) => {
      const updateData = await WhyChooseUs.findByIdAndUpdate(id,visionData,{new:true});
      if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
         return updateData;
       };
      
      const deleteWhyChooseUs = async (id) => {
      const deleteId = await WhyChooseUs.findByIdAndDelete(id);
      if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
         return  deleteId;
       };
       const createVision = async (visionData) => {
        if (!visionData.title) throw new ApiError(httpStatus.BAD_REQUEST, 'title is required!');
         return Vision.create(visionData);
       };
      
      const getVision = async () => {
         return  Vision.find();
       };
      
      const updateVision = async (id, visionData) => {
      const updateData = await Vision.findByIdAndUpdate(id,visionData,{new:true});
      if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
         return updateData;
       };
      
      const deleteVision = async (id) => {
      const deleteId = await Vision.findByIdAndDelete(id);
      if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
         return  deleteId;
       };

       const createMission = async (visionData) => {
        if (!visionData.title) throw new ApiError(httpStatus.BAD_REQUEST, 'title is required!');
         return Mission.create(visionData);
       };
      
      const getMission = async () => {
         return  Mission.find();
       };
      
      const updateMission = async (id, visionData) => {
      const updateData = await Mission.findByIdAndUpdate(id,visionData,{new:true});
      if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
         return updateData;
       };
      
      const deleteMission = async (id) => {
      const deleteId = await Mission.findByIdAndDelete(id);
      if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
         return  deleteId;
       };

       const createCoreValuesMain = async (coreValueData) => {
        if (!coreValueData.title) throw new ApiError(httpStatus.BAD_REQUEST, 'title is required!');
        
         return CoreValueMain.create(coreValueData);
       };
      
      const getCoreValuesMain = async () => {
         return  CoreValueMain.find();
       };
      
      const updateCoreValuesMain = async (id, coreValueData) => {
      const updateData = await CoreValueMain.findByIdAndUpdate(id,coreValueData,{new:true});
      if (updateData === null) throw new ApiError(httpStatus.NOT_FOUND, 'Data not found');
         return updateData;
       };
      
      const deleteCoreValuesMain = async (id) => {
      const deleteId = await CoreValueMain.findByIdAndDelete(id);
      if (deleteId === null) throw new ApiError(httpStatus.NOT_FOUND, 'Data not found');
         return  deleteId;
       };

       const getAllContacts = async () => {
        return await Contact.find().sort({ createdAt: -1 });
      };
    
      
      
export default {createCategory,getCategories,updateCategory,deleteCategory,
createProduct,getProducts,updateProduct,deleteProduct,getProductsByCategoryId,
createAboutUsPage, getAboutUsById, getAboutUsPage, updateAboutUsPage, deleteAboutUsPage,
createBlog, getBlog, updateBlog, deleteBlog, createBanner, getBanner, updateBanner, deleteBanner, 
createAboutUsMainPage, getAboutUsMainPage, getAboutUsByIdMain, updateAboutUsMainPage, deleteAboutUsMainPage,
createOurServices, getOurServices, updateOurServices, deleteOurService, createTeam, getTeam, getTeamById, updateTeam, deleteTeam,
createFeedback, getFeedbacks, updateFeedback, deleteFeedback, createFaq, getFaqs, updateFaq, deleteFaq,
createWhatWeOffer, getWhatWeOffer, updateWhatWeOffer, deleteWhatWeOffer, createCoreValues, getCoreValues, updateCoreValues, deleteCoreValues,
createVisionAndMission, getVisionAndMission, updateVisionAndMission, deleteVisionAndMission, createCompanyInfo, getCompanyInfo, updateCompanyInfo, deleteCompanyInfo,
createWhyChooseUs, getWhyChooseUs, updateWhyChooseUs, deleteWhyChooseUs, createVision, getVision, updateVision, deleteVision,
createMission, getMission, updateMission, deleteMission, createCoreValuesMain, getCoreValuesMain, updateCoreValuesMain, deleteCoreValuesMain, getAllContacts,

}