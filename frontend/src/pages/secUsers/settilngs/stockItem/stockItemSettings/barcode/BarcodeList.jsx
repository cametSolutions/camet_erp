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
  removeAll
  
} from "../../../../../../../slices/barcodeSlice";
import { useDispatch } from "react-redux";
function BarcodeList() {
  const [data, setData] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [edit, setEdit] = useState({
    id: "",
    enabled: false,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg?._id
  );
  const barcodeList = useSelector(
    (state) => state.barcode.barcodeList
  );

  const { data: apiData, loading } = useFetch(barcodeList.length === 0 &&
    `/api/sUsers/getBarcodeList/${cmp_id}`
  );
  useEffect(() => {
    dispatch(removeAll());
    if (apiData) {
      dispatch(addBarcodeList(apiData?.data));
    }
  }, [apiData]);

  useEffect(() => {
    console.log("barcodeList", barcodeList);
    setData(barcodeList);
    
  }, [barcodeList]);

  ///  handle edit
  const handleEdit = async (id, value) => {
    // setValue(value);
    // setEdit({
    //   id,
    //   enabled: true,
    // });
  };

  const handleSubmit = async (value) => {
    setUpdateLoading(true);

    setTimeout(() => {
      dispatch(addStickerName( value ));
      setUpdateLoading(false);
      setInputValue("");
    }, 500);

  };



  ///// handle click

  const handleClick = (item) => {
    dispatch(addBarcodeData(item));
    navigate("/sUsers/barcodeCreationDetails");
  
  }

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
              onClick={() => handleSubmit(inputValue)}
              // onClick={
              //   edit?.enabled
              //     ? () => editSubDetails(edit.id, value)
              //     : () => handleSubmit(value)
              // }
              className="bg-gray-800 text-white px-6 py-1 rounded-full mt-3 text-sm font-bold "
            >
              Submit
              {/* {edit ? "Update" : "Submit"} */}
            </button>
          </div>
          <div className="h-3 bg-gray-100 "></div>
        </div>
      </section>

      <section className="overflow-y-scroll h-[calc(100vh-273px)] px-4 scrollbar-thin ">
        <div className="mt-2">
          {data?.length > 0 && !loading ? (
            data.map((el) => (
              <div
              onClick={()=>{handleClick(el)}}
              // onClick={() => navigate(`/sUsers/barcodeCreationDetails/${el._id}`)}
                key={el._id}
                
                className="flex items-center justify-between border-t-0 align-middle  whitespace-nowrap p-4 mb-2 border-b cursor-pointer hover:bg-slate-100 hover:translate-y-[1px]"
              >
                <div className=" px-6 text-left text-wrap text-blueGray-700 text-sm font-bold text-gray-500">
                  {el?.stickerName}
                </div>

                <div className="flex items-center gap-12 text-xs">
                  <div className=" cursor-pointer text-center flex justify-center ">
                    <p
                      onClick={() => handleEdit(el._id, el?.stickerName)}
                      className="text-blue-500"
                    >
                      <FaEdit size={15} />
                    </p>
                  </div>
                  <div className=" cursor-pointer text-right ">
                    <p
                      // onClick={() => deleteSubDetails(el._id)}
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
