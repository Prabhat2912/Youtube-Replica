import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname;
    // Remove spaces from the original filename
    const filename = originalname.replace(/\s+/g, "");
    cb(null, filename);
  },
});

export const upload = multer({
  storage,
});
