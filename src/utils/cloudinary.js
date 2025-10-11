import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};
const uploadUpdateCloudinary = async (publicId) => {
  try {
    if (!publicId) return { result: "no id provided" }; // Return a meaningful response if no publicId is provided

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    return response;
  } catch (error) {
    console.error("Error deleting image:", error);
    return { result: "error", error }; // Return error information
  }
};
const uploadDeleteImgCloudinary = async (publicId) => {
  try {
    if (!publicId) return { result: "no id provided" }; // Return a meaningful response if no publicId is provided

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    return response;
  } catch (error) {
    console.error("Error deleting Video:", error);
    return { result: "error", error }; // Return error information
  }
};

export {
  uploadOnCloudinary,
  uploadUpdateCloudinary,
  uploadDeleteImgCloudinary,
};
