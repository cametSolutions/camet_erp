/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { IoIosAddCircle, IoIosArrowRoundBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { useDispatch } from "react-redux";
import { addParty as invoiceAddParty } from "../../../slices/invoiceSecondary";
import { addParty as salesAddParty } from "../../../slices/salesSecondary";
import { addParty as purchaseAddParty } from "../../../slices/purchase";
import { Modal } from "flowbite-react";
import sale from "../../assets/images/sale.png";
import credit from "../../assets/images/credit.png";
import purchase from "../../assets/images/purchase.png";
import debit from "../../assets/images/debit.png";
import order from "../../assets/images/order.png";
import vanSaleImg from "../../assets/images/vanSale.png";
import SearchBar from "../../components/common/SearchBar";

// import { FaShoppingCart, FaCreditCard, FaTruck, FaRegMoneyBillAlt, FaRegClipboardList, FaRegCalendarAlt } from 'react-icons/fa';

// import { MdCancel } from "react-icons/md";

function Contacts() {
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredParties, setFilteredParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedParty, setSelectedParty] = useState("");
  // const [vanSale, setVanSale] = useState(false);
  const tiles = [
    { title: "Sales", icon: sale, to: "/sUsers/sales", active: true },
    {
      title: "Credit Note",
      icon: credit,
      to: "/sUsers/creditnote ",
      active: false,
    },
    {
      title: "Purchase",
      icon: purchase,
      to: "/sUsers/purchase",
      active: false,
    },
    {
      title: "Debit Note",
      icon: debit,
      to: "/sUsers/debitnote",
      active: false,
    },
    { title: "New Order", icon: order, to: "/sUsers/invoice", active: true },
    {
      title: "VanSale",
      icon: vanSaleImg,
      to: "/sUsers/vanSale",
      active: true,
    },
  ];

  function onCloseModal() {
    setOpenModal(false);
  }

  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log(parties);

  const cpm_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  useEffect(() => {
    const fetchParties = async () => {
      try {
        const res = await api.get(`/api/sUsers/PartyList/${cpm_id}`, {
          withCredentials: true,
        });
        setLoading(false);

        setParties(res?.data?.partyList);
        // setVanSale(res?.data?.vanSale);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchParties();
  }, [cpm_id]);

  const searchData = (data) => {
    setSearch(data);
  };

  const handleNavigate = (title, to) => {
    switch (title) {
      case "Sales":
        dispatch(salesAddParty(selectedParty));
        navigate(to);
        break;
      case "Credit Note":
        navigate(to);
        break;
      case "Purchase":
        dispatch(purchaseAddParty(selectedParty));

        navigate(to);
        break;
      case "Debit Note":
        navigate(to);
        break;
      case "New Order":
        dispatch(invoiceAddParty(selectedParty));

        navigate(to);
        break;
      case "VanSale":
        dispatch(salesAddParty(selectedParty));

        navigate(to);
        break;
      default:
    }
  };

  const selectHandler = (el) => {
    setSelectedParty(el);
    setOpenModal(true);
  };

  console.log(selectedParty);
  const backHandler = () => {
    navigate(-1);
  };

  console.log(parties);
  useEffect(() => {
    if (search === "") {
      setFilteredParties(parties);
    } else {
      const filtered = parties.filter((el) =>
        el.partyName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredParties(filtered);
    }
  }, [search, parties]);

  return (
    <>
      <div className="flex-1 bg-slate-50 ">
        <div className="sticky top-0 z-20">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3   items-center gap-2 flex justify-between items-center  ">
            <div className="flex items-center gap-2">
              <IoIosArrowRoundBack
                onClick={backHandler}
                className="text-3xl text-white cursor-pointer"
              />
              <p className="text-white text-lg   font-bold ">Contacts</p>
            </div>
            <Link to={"/sUsers/addParty?from=contacts"}>
              <button className="flex items-center gap-2 text-white bg-[#40679E] px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out ">
                <IoIosAddCircle className="text-xl" />
                Add Customers
              </button>
            </Link>
          </div>

          <div className=" p-4  bg-white drop-shadow-lg">
            <div className="flex justify-between  items-center"></div>
            <div className=" md:w-1/2 ">
              {/* search bar */}
              <div className="relative  ">
                <div className="absolute inset-y-0 start-0 flex items-center  pointer-events-none ">
                  <svg
                    className="w-4 h-4 text-gray-500 "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <SearchBar onType={searchData} />
              </div>

              {/* search bar */}
            </div>
          </div>
        </div>

        {/* adding party */}

        {loading ? (
          // Show loader while data is being fetched
          <div className=" flex justify-center items-center h-screen">
            <figure className="  w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center ">
              <HashLoader color="#6056ec" size={30} speedMultiplier={1.6} />
            </figure>
          </div>
        ) : filteredParties?.length > 0 ? (
          // Show party list if parties are available
          filteredParties?.map((el, index) => (
            <div
              onClick={() => {
                selectHandler(el);
              }}
              key={index}
              className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex justify-between mx-2 rounded-sm cursor-pointer hover:bg-slate-100"
            >
              <div className="">
                <p className="font-bold">{el?.partyName}</p>
                <p className="font-medium text-gray-500 text-sm">Customer</p>
              </div>
            </div>
          ))
        ) : (
          // Show message if no parties are available
          <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
            No Parties !!!
          </div>
        )}
      </div>

      <Modal
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
        }}
        show={openModal}
        size="md"
        onClose={onCloseModal}
        popup
      >
        <Modal.Header className="bg-[#579BB1] pl-5">Menu </Modal.Header>
        <Modal.Body>
          <div className="">
            <div className="  grid grid-cols-2 gap-4 overflow-scroll">
              {tiles.map((tile, index) => (
                <div
                  onClick={() => {
                    // navigate(tile.to);
                    handleNavigate(tile?.title, tile.to);
                  }}
                  key={index}
                  className={` ${
                    tile.active === false ? " pointer-events-none" : " "
                  }
                    flex flex-col items-center justify-center p-6 md:p-3 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition-colors duration-150`}
                >
                  <div className=" shadow-lg p-5 hover:scale-110 duration-100 ease-in-out-200">
                    <img className="w-12 h-12" src={tile?.icon} alt="" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    {tile.title}
                  </p>
                </div>
              ))}
            </div>

            {/* More modal content */}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Contacts;
