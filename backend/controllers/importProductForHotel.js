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

// const parseExcelNumber = (value) => {
//   if (
//     value === undefined ||
//     value === null ||
//     String(value).trim() === ""
//   ) {
//     return null;
//   }

//   const number = Number(value);

//   return Number.isFinite(number)
//     ? number
//     : null;
// };

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

/* ============================================================
   FIND PRODUCT BY ITEM ID

   Item ID from Excel = Product._id
============================================================ */

const findProductByItemId = async ({
  itemId,
  cmp_id,
}) => {
  if (!itemId) {
    return null;
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      itemId
    )
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
  if (!productName) {
    return [];
  }

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

   Excel:
      Category = "Indian"

   Mongo:
      category = "Indian"

   Result:
      Category._id
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
   FIND SUBCATEGORY

   Excel:
      Category = Indian
      Sub Category = Snacks

   Mongo:

   Category:
      _id = ABC

   Subcategory:
      category_id = ABC
      subcategory = Snacks

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
   BUILD PRICE LEVEL DATA FOR EXISTING PRODUCT

   IMPORTANT RULE:

   Only price levels already inside the product
   will be updated.

   Example product:

   Priceleveles:
      25/26 year
      Dine In
      Take Away
      Delivery

   Excel:

      Price Rate = 100
      Dine In = 120
      Take Away = 130
      Delivery = 140

   Result:

      25/26 year → 100
      Dine In     → 120
      Take Away   → 130
      Delivery    → 140

   If Room Service does NOT exist in the product,
   it will NOT be created.
============================================================ */

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


const buildExistingProductPriceLevels = ({
  priceLevels,
  existingPriceLevels,
  defaultPrice,
  dineIn,
  takeaway,
  roomService,
  delivery,
}) => {
  if (
    !Array.isArray(existingPriceLevels) ||
    existingPriceLevels.length === 0
  ) {
    return [];
  }

  /*
   * IMPORTANT:
   *
   * 0 is a VALID price.
   *
   * Therefore we cannot use:
   *
   * if (value)
   *
   * because 0 would be treated as false.
   */
  const hasExcelValue = (value) => {
    return (
      value !== null &&
      value !== undefined
    );
  };

  /*
   * Create PriceLevel lookup
   */
  const priceLevelMap = new Map();

  for (const level of priceLevels || []) {
    priceLevelMap.set(
      String(level._id),
      level
    );
  }

  /*
   * IMPORTANT:
   *
   * Only loop through Priceleveles
   * that already exist inside the product.
   */
  return existingPriceLevels.map(
    (existingLevel) => {
      const priceLevelId =
        existingLevel?.pricelevel?._id
          ? String(
              existingLevel.pricelevel._id
            )
          : String(
              existingLevel?.pricelevel
            );

      const masterLevel =
        priceLevelMap.get(
          priceLevelId
        );

      let newPrice =
        existingLevel.pricerate;

      /*
       * ============================================
       * DINE IN
       * ============================================
       */

      if (
        masterLevel?.dineIn ===
        "enabled"
      ) {
        /*
         * 0 IS VALID
         */
        if (hasExcelValue(dineIn)) {
          newPrice = dineIn;
        }
      }

      /*
       * ============================================
       * TAKE AWAY
       * ============================================
       */

      else if (
        masterLevel?.takeaway ===
        "enabled"
      ) {
        /*
         * 0 IS VALID
         */
        if (hasExcelValue(takeaway)) {
          newPrice = takeaway;
        }
      }

      /*
       * ============================================
       * ROOM SERVICE
       * ============================================
       */

      else if (
        masterLevel?.roomService ===
        "enabled"
      ) {
        /*
         * 0 IS VALID
         *
         * Excel:
         * Room Service = 0
         *
         * Database:
         * Room Service = 100
         *
         * Result:
         * 100 → 0
         */
        if (
          hasExcelValue(roomService)
        ) {
          newPrice = roomService;
        }
      }

      /*
       * ============================================
       * DELIVERY
       * ============================================
       */

      else if (
        masterLevel?.delivery ===
        "enabled"
      ) {
        /*
         * 0 IS VALID
         *
         * Excel:
         * Delivery = 0
         *
         * Database:
         * Delivery = 100
         *
         * Result:
         * 100 → 0
         */
        if (
          hasExcelValue(delivery)
        ) {
          newPrice = delivery;
        }
      }

      /*
       * ============================================
       * OTHER PRICE LEVELS
       * ============================================
       *
       * Example:
       *
       * Price Level = 25/26 Year
       *
       * It is not:
       * Dine In
       * Take Away
       * Room Service
       * Delivery
       *
       * Therefore use Excel Price Rate.
       */

      else {
        if (
          hasExcelValue(defaultPrice)
        ) {
          newPrice = defaultPrice;
        }
      }

      /*
       * Debug
       */
      console.log(
        "PRICE LEVEL UPDATE:",
        {
          priceLevelId,

          masterPriceLevel:
            masterLevel?.pricelevel,

          oldPrice:
            existingLevel.pricerate,

          newPrice,

          excelDefaultPrice:
            defaultPrice,

          excelDineIn:
            dineIn,

          excelTakeaway:
            takeaway,

          excelRoomService:
            roomService,

          excelDelivery:
            delivery,

          dineInEnabled:
            masterLevel?.dineIn,

          takeawayEnabled:
            masterLevel?.takeaway,

          roomServiceEnabled:
            masterLevel?.roomService,

          deliveryEnabled:
            masterLevel?.delivery,
        }
      );

      /*
       * Preserve the existing subdocument _id
       * and existing pricelevel reference.
       */
      return {
        _id:
          existingLevel._id,

        pricelevel:
          existingLevel.pricelevel,

        pricerate:
          newPrice,

        priceDisc:
          existingLevel.priceDisc ?? 0,

        applicabledt:
          existingLevel.applicabledt ?? "",
      };
    }
  );
};
/* ============================================================
   BUILD PRICE LEVEL FOR NEW PRODUCT

   New product has no existing Priceleveles.

   Therefore create ONLY the normal/default price level.

   Do NOT automatically create:
      Dine In
      Take Away
      Room Service
      Delivery

   because your requirement is to update those only when
   they already exist inside the product.
============================================================ */

const buildNewProductPriceLevels = ({
  priceLevels,
  defaultPrice,
}) => {
  if (
    defaultPrice === null ||
    defaultPrice === undefined
  ) {
    return [];
  }

  /*
   * Find a normal/default price level.
   *
   * It is a price level where none of the
   * special flags are enabled.
   */
  const defaultPriceLevel =
    priceLevels.find(
      (level) =>
        level.dineIn !== "enabled" &&
        level.takeaway !==
          "enabled" &&
        level.roomService !==
          "enabled" &&
        level.delivery !== "enabled"
    );

  if (!defaultPriceLevel) {
    return [];
  }

  return [
    {
      pricelevel:
        defaultPriceLevel._id,

      pricerate:
        defaultPrice,

      priceDisc: 0,

      applicabledt: "",
    },
  ];
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
    const { under } =
      req.query;

    /* ========================================================
       1. VALIDATE COMPANY
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

    /* ========================================================
       2. VALIDATE FILE
    ======================================================== */

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Excel file is required",
      });
    }

    /* ========================================================
       3. LOAD EXCEL
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
       4. READ HEADERS
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
       5. GET CELL VALUE
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

      let value =
        cell.value;

      /*
       * Formula / rich text
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
       6. READ EXCEL ROWS
    ======================================================== */

    const excelRows = [];

    let ignoredRows = 0;

    worksheet.eachRow(
      (row, rowNumber) => {
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
         * Product name is required.
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
       7. LOAD MASTER DATA
    ======================================================== */

    const [
      categories,
      subCategories,
      priceLevels,
      hsnList,
    ] = await Promise.all([
      Category.find({
        cmp_id,
        ...(under && {
          under,
        }),
      }).lean(),

      Subcategory.find({
        cmp_id,
        ...(under && {
          under,
        }),
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
       8. CATEGORY MAP
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

    /* ========================================================
       9. SUBCATEGORY MAP

       IMPORTANT:

       subcategory.subcategory
       NOT
       subcategory.subCategory
    ======================================================== */

    const subCategoryMap =
      new Map();

    for (
      const subCategory of
        subCategories
    ) {
      if (
        !subCategory.category_id
      ) {
        continue;
      }

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

    /* ========================================================
       10. HSN MAP
    ======================================================== */

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
       11. RESULT
    ======================================================== */

    const result = {
      total:
        excelRows.length,

      updated: 0,

      created: 0,

      ignored:
        ignoredRows,

      failed: 0,

      matchedByItemId: 0,

      matchedByProductName: 0,

      errors: [],

      ignoredDetails: [],
    };

    /* ========================================================
       12. PROCESS EACH ROW
    ======================================================== */

    for (
      const row of excelRows
    ) {
      try {
        let existingProduct =
          null;

        let matchedBy =
          null;

        /* ====================================================
           STEP A
           
           ITEM ID EXISTS
           
           IMPORTANT:
           
           If Item ID is supplied, ONLY search by Item ID.
           
           If it isn't found, IGNORE.
           
           Do NOT fall back to product name.
        ==================================================== */

        if (row.itemId) {
          existingProduct =
            await findProductByItemId({
              itemId:
                row.itemId,

              cmp_id,
            });

          if (!existingProduct) {
            result.ignored++;

            result.ignoredDetails.push({
              row:
                row.rowNumber,

              product:
                row.productName,

              itemId:
                row.itemId,

              reason:
                "Item ID not found in database",
            });

            continue;
          }

          matchedBy =
            "itemId";
        }

        /* ====================================================
           STEP B
           
           ITEM ID EMPTY
           
           SEARCH BY PRODUCT NAME
        ==================================================== */

        if (
          !row.itemId
        ) {
          const products =
            await findProductsByName({
              productName:
                row.productName,

              cmp_id,
            });

          /* ==================================================
             PRODUCT NAME NOT FOUND

             CREATE NEW PRODUCT
          ================================================== */

          if (
            products.length === 0
          ) {
            existingProduct =
              null;

            matchedBy =
              "newProduct";
          }

          /* ==================================================
             EXACTLY ONE PRODUCT
          ================================================== */

          else if (
            products.length === 1
          ) {
            existingProduct =
              products[0];

            matchedBy =
              "productName";
          }

          /* ==================================================
             MULTIPLE PRODUCTS
             
             Try Category + Subcategory
          ================================================== */

          else {
            let matches =
              products;

            let excelCategory =
              null;

            /*
             * Resolve category
             */
            if (
              row.categoryName
            ) {
              excelCategory =
                getCategory(
                  categoryMap,
                  row.categoryName
                );

              /*
               * If Excel category doesn't
               * exist, fail instead of guessing.
               */
              if (
                !excelCategory
              ) {
                throw new Error(
                  `Category "${row.categoryName}" not found`
                );
              }
            }

            /*
             * Filter by category
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
             * Filter by subcategory
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
                !excelSubCategory
              ) {
                throw new Error(
                  `Sub Category "${row.subCategoryName}" not found under Category "${row.categoryName}"`
                );
              }

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

            /*
             * Exactly one match
             */
            if (
              matches.length === 1
            ) {
              existingProduct =
                matches[0];

              matchedBy =
                "productName";
            }

            /*
             * Still multiple
             */
            else {
              throw new Error(
                `Multiple products found with name "${row.productName}". Item ID is required to identify the correct product.`
              );
            }
          }
        }

        /* ====================================================
           STEP C
           
           RESOLVE CATEGORY
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
        ==================================================== */

        let subCategoryId =
          existingProduct?.sub_category ||
          null;

        if (
          row.subCategoryName
        ) {
          /*
           * Category is required to resolve
           * subcategory.
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
           
           HSN
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
           
           PRICE DATA
        ==================================================== */

        const hasPriceData =
          row.defaultPrice !==
            null ||
          row.dineIn !== null ||
          row.takeaway !== null ||
          row.roomService !== null ||
          row.delivery !== null;

        let priceLevelData =
          null;

        if (
          hasPriceData
        ) {
          /* ==================================================
             EXISTING PRODUCT

             Only update price levels already inside
             the product.
          ================================================== */

          if (
            existingProduct
          ) {
            priceLevelData =
              buildExistingProductPriceLevels({
                priceLevels,

                existingPriceLevels:
                  existingProduct.Priceleveles ||
                  [],

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

          /* ==================================================
             NEW PRODUCT

             Create default price level only.
          ================================================== */

          else {
            priceLevelData =
              buildNewProductPriceLevels({
                priceLevels,

                defaultPrice:
                  row.defaultPrice,
              });
          }
        }

        /* ====================================================
           STEP G
           
           EXISTING PRODUCT → UPDATE
        ==================================================== */

        if (
          existingProduct
        ) {
          const updateData = {
            product_name:
              row.productName,
          };

          /*
           * Category
           */
          if (
            row.categoryName
          ) {
            updateData.category =
              categoryId;
          }

          /*
           * Subcategory
           */
          if (
            row.subCategoryName
          ) {
            updateData.sub_category =
              subCategoryId;
          }

          /*
           * HSN
           */
          if (row.hsn) {
            updateData.hsn_code =
              hsnCode;
          }

          /*
           * Price levels
           */
          if (
            priceLevelData !==
            null
          ) {
            updateData.Priceleveles =
              priceLevelData;
          }

          await productModel.findOneAndUpdate(
            {
              _id:
                existingProduct._id,

              cmp_id,
            },

            {
              $set:
                updateData,
            },

            {
              new: true,

              runValidators:
                true,
            }
          );

          result.updated++;

          if (
            matchedBy ===
            "itemId"
          ) {
            result.matchedByItemId++;
          }

          if (
            matchedBy ===
            "productName"
          ) {
            result.matchedByProductName++;
          }

          continue;
        }

        /* ====================================================
           STEP H
           
           PRODUCT DOESN'T EXIST → CREATE
           
           This happens ONLY when:
           
           Item ID was empty
           AND
           Product Name wasn't found.
        ==================================================== */

        const primaryUserId =
          req.owner ||
          req.user?.primary_user_id ||
          req.user?.primaryUserId;

        if (!primaryUserId) {
          throw new Error(
            "Primary user ID not found"
          );
        }

        /*
         * Product.itemCode is unique.
         *
         * Generate one for imported
         * products because your Excel doesn't
         * contain Item Code.
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

          /*
           * Required by Product schema.
           *
           * Since the Excel file doesn't have
           * Unit, use NOS.
           */
          unit:
            "NOS",
        };

        /* ==================================================
           CATEGORY
        ================================================== */

        if (
          categoryId
        ) {
          newProductData.category =
            categoryId;
        }

        /* ==================================================
           SUBCATEGORY
        ================================================== */

        if (
          subCategoryId
        ) {
          newProductData.sub_category =
            subCategoryId;
        }

        /* ==================================================
           HSN
        ================================================== */

        if (
          hsnCode
        ) {
          newProductData.hsn_code =
            hsnCode;
        }

        /* ==================================================
           PRICE LEVEL
        ================================================== */

        if (
          priceLevelData !==
          null
        ) {
          newProductData.Priceleveles =
            priceLevelData;
        }

        /* ==================================================
           CREATE PRODUCT
        ================================================== */

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

      matched:
        result.matchedByItemId +
        result.matchedByProductName,

      matchedByItemId:
        result.matchedByItemId,

      matchedByProductName:
        result.matchedByProductName,

      errors:
        result.errors,

      ignoredDetails:
        result.ignoredDetails,
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
