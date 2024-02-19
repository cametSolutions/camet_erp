import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/logo");
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + Date.now() + "-" + file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });
  
  export const singleUpload = upload.single("logo");
