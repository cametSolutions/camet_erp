/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

import { IoIosAddCircle, IoIosArrowRoundBack } from "react-icons/io";
import { FixedSizeList as List } from "react-window";
import { useSelector } from "react-redux";

import SearchBar from "../../components/common/SearchBar";
import CustomBarLoader from "../../components/common/CustomBarLoader";
import { useNavigate } from "react-router-dom";
import { PiBarcode } from "react-icons/pi";
import BarcodeModal from "../../components/common/BarcodeModal";

function ProductListSecondary() {
  const [products, setProducts] = useState([]);

  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [listHeight, setListHeight] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState(null);

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );

  const navigate = useNavigate();
  const searchData = (data) => {
    setSearch(data);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoader(true);
      try {
        const res = await api.get(`/api/sUsers/getProducts/${cmp_id}`, {
          withCredentials: true,
        });
        setLoader(true);

        setProducts(res.data.productData);
        // setProducts([]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoader(false);
      }
    };
    fetchProducts();
  }, [refresh, cmp_id]);

  useEffect(() => {
    if (search === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((el) =>
        el.product_name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [search, products, refresh]);

  const handleDelete = async (id) => {
    // Show confirmation dialog
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    // If user confirms deletion
    if (confirmation.isConfirmed) {
      try {
        const res = await api.delete(`/api/sUsers/deleteProduct/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        // Display success message
        await Swal.fire({
          title: "Deleted!",
          text: res.data.message,
          icon: "success",
          timer: 2000, // Auto close after 2 seconds
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Refresh the page
        setRefresh(!refresh);
      } catch (error) {
        toast.error(error.response.data.message);
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 117;
      setListHeight(newHeight);
    };

    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  // const handlePrint = (el) => {
  //   let printData;

  //   const fetchPrintData = async () => {
  //     try {
  //       const res = await api.get(`/api/sUsers/getBarcodeList/${cmp_id}`, {
  //         withCredentials: true,
  //       });

  //       printData = res.data?.data[0];
  //       console.log(printData);

  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   fetchPrintData();
  //   // Extract the product name and product code
  //   // const productName = el?.product_name;
  //   // const productCode = el?.hsn_code;

  //   // console.log("data", data);

  //   // Generate the command for the barcode and product details
  //   // const generateBarcodeCommand = () => {
  //   //   return `
  //   //     SIZE 50 mm, 25 mm
  //   //     GAP 3 mm
  //   //     DIRECTION 0,0
  //   //     REFERENCE 0,0
  //   //     OFFSET 0 mm
  //   //     SET PEEL OFF
  //   //     SET CUTTER ON
  //   //     SET TEAR ON
  //   //     CLS
  //   //     BARCODE -350,155,"128M",77,0,180,2,4,"${productCode}"
  //   //     CODEPAGE 1252
  //   //     TEXT -350,180,"ROMAN.TTF",180,1,8,"${productName}"
  //   //     TEXT -350,155,"ROMAN.TTF",77,0,180,2,4,"${productCode}"
  //   //     PRINT 1,1
  //   //   `;
  //   // };

  //   // // Create the command for the barcode printout
  //   // const command = generateBarcodeCommand();

  //   // // Create a Blob from the command
  //   // const blob = new Blob([command], { type: 'text/plain' });
  //   // const url = URL.createObjectURL(blob);

  //   // // Create a new window or tab and print the Blob
  //   // const printWindow = window.open('', '_blank');
  //   // printWindow.document.write('<html><head><title>Print Command</title></head><body>');
  //   // printWindow.document.write('<pre>' + command + '</pre>');
  //   // printWindow.document.write('</body></html>');
  //   // printWindow.document.close();
  //   // printWindow.focus();
  //   // printWindow.print();
  //   // printWindow.close();

  //   // // Clean up
  //   // URL.revokeObjectURL(url);
  // };

  // const handlePrint = async (el) => {
  //   try {
  //     // Fetch print data from the API
  //     const res = await api.get(`/api/sUsers/getBarcodeList/${cmp_id}`, {
  //       withCredentials: true,
  //     });

  //     const printData = res.data?.data[0];
  //     if (!printData) {
  //       console.error("No print data found");
  //       return;
  //     }

  //     // Extract product details from the passed element
  //     const productName = el?.product_name || "Unknown Product";
  //     const productCode = el?.hsn_code || "Unknown Code";

  //     // Replace placeholders in the format with actual values
  //     const formatWithValues = printData.format1
  //       .replace(/\${productName}/g, productName)
  //       .replace(/\${productCode}/g, productCode);

  //     // Construct the complete print command
  //     const command = `
  //       ${printData.printOn}
  //       ${formatWithValues}
  //       ${printData.printOff}
  //     `;

  //     // Log the command for debugging
  //     console.log("Generated Command:", command);

  //     // Create a Blob from the command
  //     const blob = new Blob([command], { type: "text/plain" });
  //     const url = URL.createObjectURL(blob);

  //     // Open a new window or tab and print the Blob
  //     const printWindow = window.open("", "_blank");
  //     printWindow.document.write("<html><head><title>Print Command</title></head><body>");
  //     printWindow.document.write("<pre>" + command + "</pre>");
  //     printWindow.document.write("</body></html>");
  //     printWindow.document.close();
  //     printWindow.focus();
  //     printWindow.print();
  //     printWindow.close();

  //     // Clean up the object URL
  //     URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Error fetching print data:", error);
  //   }
  // };

  // const handlePrint = async (el) => {
  //   try {
  //     // Fetch print data from the API
  //     const res = await api.get(`/api/sUsers/getBarcodeList/${cmp_id}`, {
  //       withCredentials: true,
  //     });

  //     const printData = res.data?.data[0];
  //     if (!printData) {
  //       console.error("No print data found");
  //       return;
  //     }

  //     // Extract product details from the passed element
  //     const productName = el?.product_name || "Unknown Product";
  //     const productCode = el?.hsn_code || "Unknown Code";

  //     // Replace placeholders in format1 and format2 with actual values
  //     const format1WithValues = printData.format1
  //       .replace(/\${productName}/g, productName)
  //       .replace(/\${productCode}/g, productCode);

  //     const format2WithValues = printData.format2
  //       .replace(/\${productName}/g, productName)
  //       .replace(/\${productCode}/g, productCode);

  //     // Combine both formats side by side
  //     const combinedFormat = `
  //       ${printData.printOn}
  //       ${format1WithValues}

  //       ${format2WithValues}
  //       ${printData.printOff}
  //     `;

  //     // Log the command for debugging
  //     console.log("Generated Command for Double Sticker:", combinedFormat);

  //     // Create a Blob from the command
  //     const blob = new Blob([combinedFormat], { type: "text/plain" });
  //     const url = URL.createObjectURL(blob);

  //     // Open a new window or tab and print the Blob
  //     const printWindow = window.open("", "_blank");
  //     printWindow.document.write(
  //       "<html><head><title>Print Command</title></head><body>"
  //     );
  //     printWindow.document.write("<pre>" + combinedFormat + "</pre>");
  //     printWindow.document.write("</body></html>");
  //     printWindow.document.close();
  //     printWindow.focus();
  //     printWindow.print();
  //     printWindow.close();

  //     // Clean up the object URL
  //     URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Error fetching print data:", error);
  //   }
  // };

  const handlePrint = (el) => {
    setOpenModal(true);
    setSelectedProductForPrint(el);
  };

  const Row = ({ index, style }) => {
    const el = filteredProducts[index];
    const adjustedStyle = {
      ...style,
      marginTop: "16px",
      height: "150px",
    };

    return (
      <>
        <div
          key={index}
          style={adjustedStyle}
          className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col mx-2 rounded-sm cursor-pointer hover:bg-slate-100  pr-7  "
        >
          <div className="flex justify-between w-full gap-3 ">
            <div className="">
              <p className="font-bold text-sm">{el?.product_name}</p>
            </div>
            <div
              className={`
                 ${
                type !== "self" ? "pointer-events-none opacity-50" : ""
              }  


              flex gap-3 mt-2 px-4`}
            >
              <Link to={`/sUsers/editProduct/${el._id}`}>
                <FaEdit className="text-blue-500" />
              </Link>

              <MdDelete
                onClick={() => {
                  handleDelete(el._id);
                }}
                className="text-red-500"
              />
            </div>
          </div>
          <div className=" flex   gap-2 text-sm mt-4">
            <div className="flex gap-2 text-nowrap">
              <p className="font-bold text-gray-400 uppercase ">Hsn :</p>
              <p className="font-semibold text-gray-400"> {el?.hsn_code}</p>
            </div>
            <div className="flex gap-2 ">
              <p className="font-bold text-gray-400">Tax :</p>
              <p className=" text-gray-400"> {`${el?.igst} %`}</p>
            </div>
          </div>
          <hr className="mt-6" style={{ borderWidth: "1px" }} />
          <div className="flex justify-end  text-lg items-center mt-4 mr-4">
            <PiBarcode onClick={() => handlePrint(el)} />
          </div>
        </div>
      </>
    );
  };

  //   const generateBarcodeCommand = (productCode, productName, dateValue, invoiceNumber, testValue) => {
  //     return `
  //       SIZE 50 mm, 25 mm
  //       GAP 3 mm
  //       DIRECTION 0,0
  //       REFERENCE 0,0
  //       OFFSET 0 mm
  //       SET PEEL OFF
  //       SET CUTTER ON
  //       SET TEAR ON
  //       CLS
  //       BARCODE -350,155,"128M",77,0,180,2,4,"${productCode}"  // productCode as barcode
  //       CODEPAGE 1252
  //       TEXT -350,180,"ROMAN.TTF",180,1,8,"${productName}"  // productName as text
  //       TEXT -350,76,"ROMAN.TTF",180,1,6,"${dateValue}"
  //       TEXT -350,60,"ROMAN.TTF",180,1,7,"${invoiceNumber}"
  //       TEXT -350,34,"ROMAN.TTF",180,1,8,"${testValue}"
  //       PRINT 1,1
  //     `;
  // };

  return (
    <>
      <BarcodeModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        product={selectedProductForPrint}
      />
      <div className="flex-1 bg-slate-50  h-screen overflow-hidden  ">
        <div className="sticky top-0 z-20 ">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3  flex justify-between items-center  ">
            <div className="flex items-center justify-center gap-2">
              <IoIosArrowRoundBack
                onClick={() => navigate("/sUsers/dashboard")}
                className="cursor-pointer text-3xl text-white "
              />
              <p className="text-white text-lg   font-bold ">Your Products</p>
            </div>
            {type === "self" && (
              <div>
                <Link to={"/sUsers/addProduct"}>
                  <button className="flex items-center gap-2 text-white bg-[#40679E] px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out ">
                    <IoIosAddCircle className="text-xl" />
                    Add Products
                  </button>
                </Link>
              </div>
            )}
          </div>

          <SearchBar onType={searchData} />
        </div>

        {/* adding party */}

        {loader && <CustomBarLoader />}

        {!loader && products.length === 0 && (
          <div className="flex justify-center items-center mt-20 overflow-hidden font-bold text-gray-500">
            {" "}
            Oops!!.No Products Found
          </div>
        )}

        <div className="">
          <List
            className=""
            height={listHeight} // Specify the height of your list
            itemCount={filteredProducts.length} // Specify the total number of items
            itemSize={165} // Specify the height of each item
          >
            {Row}
          </List>
        </div>
      </div>
    </>
  );
}

export default ProductListSecondary;
