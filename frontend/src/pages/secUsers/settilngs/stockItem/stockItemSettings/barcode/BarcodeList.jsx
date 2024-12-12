import TitleDiv from "../../../../../../components/common/TitleDiv";
import { useNavigate } from "react-router-dom";
import useFetch from "../../../../../../customHook/useFetch";
import { useSelector } from "react-redux";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  addBarcodeList,
  addStickerName,
  addBarcodeData,
  editBarcodeDataInList,
  deleteBarcodeFromList
} from "../../../../../../../slices/barcodeSlice";
import { useDispatch } from "react-redux";
import api from "../../../../../../api/api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
function BarcodeList() {
  const [data, setData] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [edit, setEdit] = useState({
    index: "",
    enabled: false,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg?._id
  );
  const barcodeList = useSelector((state) => state.barcode.barcodeList);

  const { data: apiData, loading } = useFetch(
    barcodeList.length === 0 && `/api/sUsers/getBarcodeList/${cmp_id}`
  );
  useEffect(() => {
    // dispatch(removeAll());
    if (apiData) {
      dispatch(addBarcodeList(apiData?.data));
    }
  }, [apiData]);

  useEffect(() => {
    if (inputValue === "") {
      setEdit(false);
    }
  }, [inputValue]);

  useEffect(() => {
    console.log("barcodeList", barcodeList);
    setData(barcodeList);
  }, [barcodeList]);

  ///  handle edit
  const handleEdit = async (index, value) => {
    setInputValue(value);
    setEdit({
      index,
      enabled: true,
    });
  };

  const handleSubmit = async (value) => {
    setUpdateLoading(true);

    setTimeout(() => {
      dispatch(addStickerName(value));
      setUpdateLoading(false);
      setInputValue("");
    }, 500);
  };

  ///// handle click

  const handleClick = (item) => {
    dispatch(addBarcodeData(item));
    navigate("/sUsers/barcodeCreationDetails");
  };

  ///// handle edit data

  const editBarcodeData = async (index, value) => {
    setUpdateLoading(true);
    const dataToEdit = data[index];
    if (dataToEdit) {
      if (dataToEdit?._id) {
        const { printOn, printOff, format1, format2 } = dataToEdit;
        const editBarcodeData = {
          stickerName : inputValue,
          printOn,
          printOff,
          format1,
          format2,
        };
        try {
          const res = await api.put(
            `/api/sUsers/editBarcodeData/${dataToEdit?._id}/${cmp_id}`,
            editBarcodeData,
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );

          toast.success(res.data.message);
          dispatch(editBarcodeDataInList({ index, stickerName: value }));
          setInputValue("");
        } catch (error) {
          toast.error(error.response.data.message);
          console.log(error);
        } finally {
          setUpdateLoading(false);
        }
      } else {
        setTimeout(() => {
          dispatch(editBarcodeDataInList({ index, stickerName: value }));
          setInputValue("");
          setUpdateLoading(false);
        }, 500);
      }
    }
  };

  ///// handle delete data

  const deleteBarcodeData = async (index) => {
    const dataToEdit = data[index];
    if (dataToEdit) {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action will permanently delete the barcode.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });
  
      if (result.isConfirmed) {
        setUpdateLoading(true);
        if (dataToEdit?._id) {
          try {
            const res = await api.delete(
              `/api/sUsers/deleteBarcode/${dataToEdit?._id}/${cmp_id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
                withCredentials: true,
              }
            );
  
            dispatch(deleteBarcodeFromList({ index }));
            setInputValue("");
            toast.success(res.data.message);
  
            Swal.fire("Deleted!", "The barcode has been deleted.", "success");
          } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
            console.error(error);
          } finally {
            setUpdateLoading(false);
          }
        } else {
          setTimeout(() => {
            dispatch(deleteBarcodeFromList({ index }));
            setInputValue("");
            setUpdateLoading(false);
          }, 500);
  
          Swal.fire("Deleted!", "The barcode has been removed.", "success");
        }
      }
    }
  };
  

  const loader = updateLoading || loading;

  return (
    <div className="flex flex-col">
      <TitleDiv
        title="Barcode List"
        from="/sUsers/StockItem"
        loading={loader}
      />
      <section>
        <div className="flex flex-col justify-center  sticky top-0 z-10 ">
          <div className=" flex justify-center items-center flex-col bg-[#508991] py-14">
            <h2 className="font-bold uppercase text-white">ADD NEW BARCODE</h2>
            <input
              type="text"
              // onKeyDown={(e) => {
              //   if (e.key === "Enter") {
              //     handleSubmit(value);
              //   }
              // }}
              placeholder={`Enter your sticker name `}
              className=" w-4/6  sm:w-2/6   p-1 text-black border border-gray-300 rounded-full mt-3 text-center"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              // onClick={() => handleSubmit(inputValue)}
              onClick={
                edit?.enabled
                  ? () => editBarcodeData(edit.index, inputValue)
                  : () => handleSubmit(inputValue)
              }
              className="bg-gray-800 text-white px-6 py-1 rounded-full mt-3 text-sm font-bold "
            >
              {/* Submit */}
              {edit ? "Update" : "Submit"}
            </button>
          </div>
          <div className="h-3 bg-gray-100 "></div>
        </div>
      </section>

      <section className="overflow-y-scroll h-[calc(100vh-273px)] px-4 scrollbar-thin ">
        <div className="mt-2">
          {data?.length > 0 && !loading ? (
            data.map((el, index) => (
              <div
                // onClick={() => navigate(`/sUsers/barcodeCreationDetails/${el._id}`)}
                key={index}
                className="flex items-center justify-between border-t-0 align-middle  whitespace-nowrap p-4 mb-2 border-b cursor-pointer hover:bg-slate-100 hover:translate-y-[1px]"
              >
                <div
                  onClick={() => {
                    handleClick(el);
                  }}
                  className=" px-6 text-left text-wrap text-blueGray-700 text-sm font-bold text-gray-500"
                >
                  {el?.stickerName}
                </div>

                <div className="flex items-center gap-12 text-xs">
                  <div className=" cursor-pointer text-center flex justify-center ">
                    <p
                      onClick={() => handleEdit(index, el?.stickerName)}
                      className="text-blue-500"
                    >
                      <FaEdit size={15} />
                    </p>
                  </div>
                  <div className=" cursor-pointer text-right ">
                    <p
                      onClick={() => deleteBarcodeData(index)}
                      className="flex justify-end mr-4 text-red-500"
                    >
                      <FaTrash />
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 font-bold  whitespace-nowrap p-4 ">
              {!loading && <p>Data not found</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default BarcodeList;
