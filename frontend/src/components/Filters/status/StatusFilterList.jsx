import TitleDiv from "../../common/TitleDiv";
import { MdPaid } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setSelectedStatus } from "../../../../slices/filterSlices/statusFilter";
import { useNavigate, useLocation } from "react-router-dom";

function StatusFilterList() {
  const status = [
    { title: "All", value: "all" },
    { title: "Paid", value: "paid" },
    { title: "Partially Paid", value: "partiallyPaid" },
    { title: "Unpaid", value: "unpaid" },
  ];

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const selectionHandler = (value) => {

    
    dispatch(setSelectedStatus(value));
    navigate(location?.state?.from);
  };

  return (
    <div>
      <section>
        <TitleDiv title="Status" />
        <section className="flex flex-col gap-2 p-4 ">
          {status.map((el, index) => (
            <div
              onClick={() => selectionHandler(el)}
              key={index}
              className="flex items-center gap-5 cursor-pointer bg-white shadow-lg p-6 hover:shadow-xl hover:bg-slate-100"
            >
              <MdPaid />
              <p className=" text-gray-500 text-sm font-bold  ">{el?.title}</p>
            </div>
          ))}
        </section>
      </section>
    </div>
  );
}

export default StatusFilterList;
