import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLODINARY_CLOUD_NAME,
  api_key: process.env.CLODINARY_API_KEY,
  api_secret: process.env.CLODINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    //upload the file on cloudinary

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved file as the upload operation failed
    return null;
  }
};

const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);

    const result = await cloudinary.api.delete_resources([publicId], {
      type: "upload",
      resource_type: "image",
    });

    console.log(result);

    console.log(`Image with public_id ${publicId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error.message);
  }
};
function extractPublicIdFromUrl(imageUrl) {
  const parts = imageUrl.split("/");
  const filename = parts[parts.length - 1];
  const publicId = filename.split(".")[0];
  return publicId;
}

// cloudinary.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );

export { uploadOnCloudinary, deleteImageFromCloudinary };
