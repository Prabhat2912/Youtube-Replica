import axios from "axios";

const uploadOnCloudinary = (image) => {
  return new Promise((resolve, reject) => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    axios
      .post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/upload`,
        data
      )
      .then((res) => {
        console.log(res.data);
        resolve(res.data);
      })
      .catch((err) => {
        console.log(err, "err while uploading");
        reject(err);
      });
  });
};

export default uploadOnCloudinary;
