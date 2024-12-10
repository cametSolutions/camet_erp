import  { useEffect } from "react";
import { CgEditBlackPoint } from "react-icons/cg";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function SelectedBarcode() {
  const { stickerName } = useSelector((state) => state.barcode);

  const navigate = useNavigate();

  useEffect(() => {
    if (!stickerName || stickerName === "") {
      navigate("/sUsers/barcodeList");
    }
  }, [stickerName]);
  
  return (
    <div className="bg-white py-2 px-6 text-gray-500 font-bold shadow-lg mb-3 flex items-center gap-2  text-sm">
      <CgEditBlackPoint className=" mt-0.5" />
      <p>{stickerName}</p>
    </div>
  );
}

export default SelectedBarcode;
