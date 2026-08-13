import mongoose from "mongoose";
import ExcelJS from "exceljs";

import productModel from "../models/productModel.js";

import {
  Category,
  Subcategory,
  PriceLevel,
} from "../models/subDetails.js";

import hsnModel from "../models/hsnModel.js";


/* ============================================================
   HELPERS
============================================================ */

const normalizeText = (value) => {
  return String(value ?? "")
    .replace(/\u00A0/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

const cleanText = (value) => {
  return String(value ?? "")
    .replace(/\u00A0/g, " ")
    .trim()
    .replace(/\s+/g, " ");
};

const cleanHsn = (value) => {
  return String(value ?? "")
    .replace(/\u00A0/g, "")
    .replace(/\s+/g, "")
    .trim();
};

const parseExcelNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};


/* ============================================================
   FIND PRODUCT BY ITEM ID

   Excel Item ID = Product._id
============================================================ */

const findProductByItemId = async ({
  itemId,
  cmp_id,
}) => {
  if (!itemId) {
    return null;
  }

  if (
    !mongoose.Types.ObjectId.isValid(itemId)
  ) {
    return null;
  }

  return await productModel.findOne({
    _id: itemId,
    cmp_id,
  });
};


/* ============================================================
   FIND PRODUCT BY PRODUCT NAME
============================================================ */

const findProductsByName = async ({
  productName,
  cmp_id,
}) => {
  const regex = new RegExp(
    `^${escapeRegex(productName)}$`,
    "i"
  );

  return await productModel.find({
    cmp_id,
    product_name: regex,
  });
};


/* ============================================================
   FIND CATEGORY

   Category schema:

   {
      category: String,
      cmp_id: ObjectId
   }
============================================================ */

const getCategory = (
  categoryMap,
  categoryName
) => {
  if (!categoryName) {
    return null;
  }

  return (
    categoryMap.get(
      normalizeText(categoryName)
    ) || null
  );
};


/* ============================================================
   FIND SUB CATEGORY

   Subcategory schema:

   {
      subcategory: String,
      category_id: ObjectId,
      cmp_id: ObjectId
   }
============================================================ */

const getSubCategory = (
  subCategoryMap,
  subCategoryName,
  categoryId
) => {
  if (
    !subCategoryName ||
    !categoryId
  ) {
    return null;
  }

  const key =
    `${String(categoryId)}|${normalizeText(
      subCategoryName
    )}`;

  return (
    subCategoryMap.get(key) ||
    null
  );
};


/* ============================================================
   BUILD PRICE LEVEL DATA

   IMPORTANT:
   Only called when at least one price exists
   in Excel.

   Existing price levels are preserved when
   an individual Excel price cell is empty.
============================================================ */

const buildPriceLevelData = ({
  priceLevels,
  existingPriceLevels,
  defaultPrice,
  dineIn,
  takeaway,
  roomService,
  delivery,
}) => {
  const result = [];

  const getExistingPrice = (
    priceLevelId
  ) => {
    const existing =
      existingPriceLevels.find(
        (item) =>
          String(
            item.pricelevel?._id ||
              item.pricelevel
          ) ===
          String(priceLevelId)
      );

    return existing?.pricerate ?? null;
  };


  for (const level of priceLevels) {
    let excelPrice = null;

    /* -----------------------------------------
       DEFAULT PRICE
    ----------------------------------------- */

    if (
      level.dineIn === "" &&
      level.takeaway === "" &&
      level.roomService === "" &&
      level.delivery === ""
    ) {
      excelPrice =
        defaultPrice;
    }

    /* -----------------------------------------
       DINE IN
    ----------------------------------------- */

    else if (
      level.dineIn === "enabled"
    ) {
      excelPrice =
        dineIn;
    }

    /* -----------------------------------------
       TAKE AWAY
    ----------------------------------------- */

    else if (
      level.takeaway === "enabled"
    ) {
      excelPrice =
        takeaway;
    }

    /* -----------------------------------------
       ROOM SERVICE
    ----------------------------------------- */

    else if (
      level.roomService === "enabled"
    ) {
      excelPrice =
        roomService;
    }

    /* -----------------------------------------
       DELIVERY
    ----------------------------------------- */

    else if (
      level.delivery === "enabled"
    ) {
      excelPrice =
        delivery;
    }


    /* -----------------------------------------
       Excel value is empty.

       Preserve existing value if this is
       an existing product.
    ----------------------------------------- */

    if (excelPrice === null) {
      excelPrice =
        getExistingPrice(level._id);
    }


    /*
     * If there is still no price, don't add
     * this price level.
     */

    if (excelPrice === null) {
      continue;
    }


    const existing =
      existingPriceLevels.find(
        (item) =>
          String(
            item.pricelevel?._id ||
              item.pricelevel
          ) ===
          String(level._id)
      );


    result.push({
      pricelevel:
        level._id,

      pricerate:
        excelPrice,

      priceDisc:
        existing?.priceDisc ?? 0,

      applicabledt:
        existing?.applicabledt ?? "",
    });
  }


  return result;
};


/* ============================================================
   IMPORT EXCEL
============================================================ */

export const importItemsFromExcel = async (
  req,
  res
) => {
  try {
    const { cmp_id } =
      req.params;


    /* ========================================================
       1. BASIC VALIDATION
    ======================================================== */

    if (
      !mongoose.Types.ObjectId.isValid(
        cmp_id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid company ID",
      });
    }


    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Excel file is required",
      });
    }


    /* ========================================================
       2. LOAD EXCEL
    ======================================================== */

    const workbook =
      new ExcelJS.Workbook();

    await workbook.xlsx.load(
      req.file.buffer
    );


    const worksheet =
      workbook.worksheets[0];


    if (!worksheet) {
      return res.status(400).json({
        success: false,
        message:
          "Excel worksheet not found",
      });
    }


    /* ========================================================
       3. READ EXCEL HEADERS
    ======================================================== */

    const headerMap = {};

    worksheet
      .getRow(1)
      .eachCell(
        (cell, columnNumber) => {
          const header =
            normalizeText(
              cell.value
            );

          if (header) {
            headerMap[header] =
              columnNumber;
          }
        }
      );


    /*
     * Product Name is the ONLY required
     * Excel column.
     */

    if (
      !headerMap["product name"]
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Excel must contain "Product Name" column',
      });
    }


    /* ========================================================
       4. GET CELL VALUE
    ======================================================== */

    const getCellValue = (
      row,
      columnName
    ) => {
      const column =
        headerMap[
          normalizeText(
            columnName
          )
        ];

      if (!column) {
        return "";
      }


      const cell =
        row.getCell(column);


      const value =
        cell.value;


      /*
       * Handle formula / rich values.
       */

      if (
        value &&
        typeof value === "object"
      ) {
        if (
          Object.prototype.hasOwnProperty.call(
            value,
            "text"
          )
        ) {
          return value.text;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            value,
            "result"
          )
        ) {
          return value.result;
        }
      }


      return value ?? "";
    };


    /* ========================================================
       5. READ EXCEL ROWS
    ======================================================== */

    const excelRows = [];

    let ignoredRows = 0;


    worksheet.eachRow(
      (row, rowNumber) => {
        /*
         * Header
         */

        if (rowNumber === 1) {
          return;
        }


        const productName =
          cleanText(
            getCellValue(
              row,
              "Product Name"
            )
          );


        /*
         * PRODUCT NAME EMPTY
         *
         * Ignore the row.
         */

        if (!productName) {
          ignoredRows++;
          return;
        }


        const itemId =
          cleanText(
            getCellValue(
              row,
              "Item ID"
            )
          );


        const categoryName =
          cleanText(
            getCellValue(
              row,
              "Category"
            )
          );


        const subCategoryName =
          cleanText(
            getCellValue(
              row,
              "Sub Category"
            )
          );


        const hsn =
          cleanHsn(
            getCellValue(
              row,
              "HSN Code"
            )
          );


        const defaultPrice =
          parseExcelNumber(
            getCellValue(
              row,
              "Price Rate"
            )
          );


        const dineIn =
          parseExcelNumber(
            getCellValue(
              row,
              "Dine In"
            )
          );


        const takeaway =
          parseExcelNumber(
            getCellValue(
              row,
              "Take Away"
            )
          );


        const roomService =
          parseExcelNumber(
            getCellValue(
              row,
              "Room Service"
            )
          );


        const delivery =
          parseExcelNumber(
            getCellValue(
              row,
              "Delivery"
            )
          );


        excelRows.push({
          rowNumber,

          itemId,

          productName,

          categoryName,

          subCategoryName,

          hsn,

          defaultPrice,

          dineIn,

          takeaway,

          roomService,

          delivery,
        });
      }
    );


    /* ========================================================
       6. LOAD MASTER DATA ONCE
    ======================================================== */

    const [
      categories,
      subCategories,
      priceLevels,
      hsnList,
    ] = await Promise.all([
      Category.find({
        cmp_id,
      }).lean(),

      Subcategory.find({
        cmp_id,
      }).lean(),

      PriceLevel.find({
        cmp_id,
      })
        .select(
          "_id pricelevel dineIn takeaway roomService delivery"
        )
        .lean(),

      hsnModel.find({}).lean(),
    ]);


    /* ========================================================
       7. CREATE LOOKUP MAPS
    ======================================================== */

    const categoryMap =
      new Map();


    for (
      const category of categories
    ) {
      categoryMap.set(
        normalizeText(
          category.category
        ),
        category
      );
    }


    const subCategoryMap =
      new Map();


    for (
      const subCategory of
        subCategories
    ) {
      const key =
        `${String(
          subCategory.category_id
        )}|${normalizeText(
          subCategory.subcategory
        )}`;

      subCategoryMap.set(
        key,
        subCategory
      );
    }


    const hsnMap =
      new Map();


    for (
      const hsnItem of hsnList
    ) {
      hsnMap.set(
        cleanHsn(
          hsnItem.hsn
        ),
        hsnItem
      );
    }


    /* ========================================================
       8. RESULT
    ======================================================== */

    const result = {
      total:
        excelRows.length,

      updated: 0,

      created: 0,

      ignored:
        ignoredRows,

      failed: 0,

      errors: [],
    };


    /* ========================================================
       9. PROCESS EACH EXCEL ROW
    ======================================================== */

    for (
      const row of excelRows
    ) {
      try {
        let existingProduct =
          null;


        /* ====================================================
           STEP A
           
           FIRST CHECK ITEM ID
        ==================================================== */

        if (row.itemId) {
          existingProduct =
            await findProductByItemId({
              itemId:
                row.itemId,

              cmp_id,
            });
        }


        /* ====================================================
           STEP B

           IF ID NOT FOUND → CHECK PRODUCT NAME
        ==================================================== */

        if (!existingProduct) {
          const products =
            await findProductsByName({
              productName:
                row.productName,

              cmp_id,
            });


          /*
           * One product with this name
           */

          if (
            products.length === 1
          ) {
            existingProduct =
              products[0];
          }


          /*
           * Multiple products with same name.
           *
           * Try Category + Subcategory.
           */

          else if (
            products.length > 1
          ) {
            let matches =
              products;


            /*
             * Resolve Excel Category
             */

            let excelCategory =
              null;

            if (
              row.categoryName
            ) {
              excelCategory =
                getCategory(
                  categoryMap,
                  row.categoryName
                );
            }


            /*
             * If Category supplied,
             * filter products by category.
             */

            if (
              excelCategory
            ) {
              matches =
                matches.filter(
                  (product) =>
                    String(
                      product.category
                    ) ===
                    String(
                      excelCategory._id
                    )
                );
            }


            /*
             * Resolve Excel Subcategory.
             */

            if (
              row.subCategoryName &&
              excelCategory
            ) {
              const excelSubCategory =
                getSubCategory(
                  subCategoryMap,
                  row.subCategoryName,
                  excelCategory._id
                );


              if (
                excelSubCategory
              ) {
                matches =
                  matches.filter(
                    (product) =>
                      String(
                        product.sub_category
                      ) ===
                      String(
                        excelSubCategory._id
                      )
                  );
              }
            }


            /*
             * Exactly one product remains.
             */

            if (
              matches.length === 1
            ) {
              existingProduct =
                matches[0];
            } else {
              throw new Error(
                `Multiple products found with name "${row.productName}". Item ID is required to identify the correct product.`
              );
            }
          }
        }


        /* ====================================================
           STEP C

           RESOLVE CATEGORY

           OPTIONAL
        ==================================================== */

        let categoryId =
          existingProduct?.category ||
          null;


        if (
          row.categoryName
        ) {
          const category =
            getCategory(
              categoryMap,
              row.categoryName
            );


          if (!category) {
            throw new Error(
              `Category "${row.categoryName}" not found`
            );
          }


          categoryId =
            category._id;
        }


        /* ====================================================
           STEP D

           RESOLVE SUBCATEGORY

           OPTIONAL
        ==================================================== */

        let subCategoryId =
          existingProduct?.sub_category ||
          null;


        if (
          row.subCategoryName
        ) {
          /*
           * To find a subcategory correctly,
           * we need its Category.
           */

          if (!categoryId) {
            throw new Error(
              `Sub Category "${row.subCategoryName}" cannot be used because Category is empty`
            );
          }


          const subCategory =
            getSubCategory(
              subCategoryMap,
              row.subCategoryName,
              categoryId
            );


          if (!subCategory) {
            throw new Error(
              `Sub Category "${row.subCategoryName}" not found under Category "${row.categoryName}"`
            );
          }


          subCategoryId =
            subCategory._id;
        }


        /* ====================================================
           STEP E

           VALIDATE HSN

           OPTIONAL
        ==================================================== */

        let hsnCode =
          existingProduct?.hsn_code ||
          "";


        if (row.hsn) {
          const hsnExists =
            hsnMap.has(
              row.hsn
            );


          if (!hsnExists) {
            throw new Error(
              `HSN "${row.hsn}" not found`
            );
          }


          hsnCode =
            row.hsn;
        }


        /* ====================================================
           STEP F

           CHECK WHETHER EXCEL HAS PRICE DATA
        ==================================================== */

        const hasPriceData =
          row.defaultPrice !== null ||
          row.dineIn !== null ||
          row.takeaway !== null ||
          row.roomService !== null ||
          row.delivery !== null;


        let priceLevelData =
          null;


        if (
          hasPriceData
        ) {
          priceLevelData =
            buildPriceLevelData({
              priceLevels,

              existingPriceLevels:
                existingProduct
                  ?.Priceleveles || [],

              defaultPrice:
                row.defaultPrice,

              dineIn:
                row.dineIn,

              takeaway:
                row.takeaway,

              roomService:
                row.roomService,

              delivery:
                row.delivery,
            });
        }


        /* ====================================================
           STEP G

           EXISTING PRODUCT → UPDATE
        ==================================================== */

        if (existingProduct) {
          const updateData = {
            /*
             * Product name from Excel is always
             * used because it is required.
             */

            product_name:
              row.productName,
          };


          /*
           * Category only changes if Excel
           * contains a Category value.
           */

          if (
            row.categoryName
          ) {
            updateData.category =
              categoryId;
          }


          /*
           * Subcategory only changes if
           * Excel contains Subcategory.
           */

          if (
            row.subCategoryName
          ) {
            updateData.sub_category =
              subCategoryId;
          }


          /*
           * HSN only changes if Excel
           * contains HSN.
           */

          if (row.hsn) {
            updateData.hsn_code =
              hsnCode;
          }


          /*
           * Price levels only change if
           * Excel contains at least one
           * price.
           */

          if (
            priceLevelData !== null
          ) {
            updateData.Priceleveles =
              priceLevelData;
          }


          await productModel.findByIdAndUpdate(
            existingProduct._id,

            {
              $set: updateData,
            },

            {
              new: true,

              runValidators: true,
            }
          );


          result.updated++;

          continue;
        }


        /* ====================================================
           STEP H

           PRODUCT DOESN'T EXIST → CREATE
        ==================================================== */

        /*
         * Product Name is already guaranteed
         * to exist here.
         */

        const primaryUserId =
          req.user?.Primary_user_id ||
          req.user?.primary_user_id ||
          req.user?.primaryUserId;


        if (!primaryUserId) {
          throw new Error(
            "Primary user ID not found"
          );
        }


        /*
         * Generate unique itemCode because
         * Product.itemCode is unique.
         */

        const generatedItemCode =
          `IMP-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase()}`;


        const newProductData = {
          product_name:
            row.productName,

          itemCode:
            generatedItemCode,

          product_image:
            "",

          cmp_id,

          product_code:
            "",

          balance_stock:
            0,

          Primary_user_id:
            primaryUserId,

          unit:
            "NOS",
        };


        /*
         * Category is optional.
         */

        if (
          categoryId
        ) {
          newProductData.category =
            categoryId;
        }


        /*
         * Subcategory is optional.
         */

        if (
          subCategoryId
        ) {
          newProductData.sub_category =
            subCategoryId;
        }


        /*
         * HSN is optional.
         */

        if (
          hsnCode
        ) {
          newProductData.hsn_code =
            hsnCode;
        }


        /*
         * Prices are optional.
         */

        if (
          priceLevelData !== null
        ) {
          newProductData.Priceleveles =
            priceLevelData;
        }


        await productModel.create(
          newProductData
        );


        result.created++;
      } catch (error) {
        result.failed++;

        result.errors.push({
          row:
            row.rowNumber,

          product:
            row.productName,

          message:
            error.message,
        });
      }
    }


    /* ========================================================
       FINAL RESPONSE
    ======================================================== */

    return res.status(200).json({
      success: true,

      message:
        "Excel import completed successfully",

      total:
        result.total,

      updated:
        result.updated,

      created:
        result.created,

      ignored:
        result.ignored,

      failed:
        result.failed,

      errors:
        result.errors,
    });
  } catch (error) {
    console.error(
      "importItemsFromExcel error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to import Excel",

      error:
        error.message,
    });
  }
};