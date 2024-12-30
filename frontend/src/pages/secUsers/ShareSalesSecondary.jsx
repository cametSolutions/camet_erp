import { useRef, useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import api from "../../api/api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { Link } from "react-router-dom";
import SalesPdf from "../../components/pdf/sales/SalesPdf";

import ShareModal from "./settilngs/dataEntry/modals/ShareModal";
import { IoShareSocial } from "react-icons/io5";
import { useSelector } from "react-redux";
import SalesPdfNonInd from "../../components/pdf/sales/nonIndian/SalesPdfNonInd";

function ShareSalesSecondary() {
  const [data, setData] = useState([]);
  const [org, setOrg] = useState([]);
  const [bank, setBank] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams();

  const IsIndian =
    useSelector(
      (state) => state.secSelectedOrganization.secSelectedOrg.country
    ) === "India";


  const contentToPrint = useRef(null);

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        // Fetch invoice details
        const res = await api.get(`/api/sUsers/getSalesDetails/${id}`, {
          withCredentials: true,
        });

        // Extract cmp_id from the response
        const cmpId = res.data.data.cmp_id; // Assuming cmp_id is a property of the data
        // Update the state with the cmp_id

        // Fetch company details using the cmp_id
        const companyDetails = await api.get(
          `/api/sUsers/getSingleOrganization/${cmpId}`,
          {
            withCredentials: true,
          }
        );

        setData(res.data.data);
        setOrg(companyDetails?.data?.organizationData);
        setBank(
          companyDetails?.data?.organizationData?.configurations[0]?.bank
        );
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };

    getTransactionDetails();
  }, [id]);

  return (
    <div className="">
      <div className="">
        <div className="bg-[#012a4a]   sticky top-0 p-3 px-5 text-white text-lg font-bold flex items-center gap-3  shadow-lg justify-between">
          <div className="flex gap-2 ">
            <Link to={`/sUsers/salesDetails/${id}`}>
              <IoIosArrowRoundBack className="text-3xl" />
            </Link>
            <p>Share Your Sale</p>
          </div>
          <div className="flex">
            <IoShareSocial
              className="text-xl cursor-pointer"
              onClick={() => setShowModal(true)}
            />
          </div>
        </div>

        <ShareModal
          data={data}
          org={org}
          contentToPrint={contentToPrint}
          showModal={showModal}
          setShowModal={setShowModal}
        />

        {IsIndian ? (
          <SalesPdf
            contentToPrint={contentToPrint}
            data={data}
            org={org}
            bank={bank}
            userType="secondaryUser"
            tab="sales"
          />
        ) : (
          <SalesPdfNonInd
            contentToPrint={contentToPrint}
            data={data}
            org={org}
            bank={bank}
            userType="secondaryUser"
            tab="sales"
          />
        )}
      </div>
    </div>
  );
}

export default ShareSalesSecondary;
