import multer from "multer";

const storage =
  multer.memoryStorage();

export const uploadExcel =
  multer({
    storage,

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      const extension =
        file.originalname
          .toLowerCase()
          .slice(
            file.originalname.lastIndexOf(".")
          );

      if (
        extension !== ".xlsx" &&
        extension !== ".xls"
      ) {
        return cb(
          new Error(
            "Only Excel files are allowed"
          )
        );
      }

      cb(null, true);
    },
  });