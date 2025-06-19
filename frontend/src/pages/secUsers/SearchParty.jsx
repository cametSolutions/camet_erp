import PartyListComponent from "@/pages/masters/party/PartyListComponent";
import TitleDiv from "@/components/common/TitleDiv";
import { useLocation } from "react-router-dom";

function SearchParty() {
  const location = useLocation();

  const accountingVoucherPaths = ["searchPartyReceipt", "searchPartyPayment"];
  const pathSegments = location.pathname.split("/").filter(Boolean); // removes empty strings
  const lastSegment = pathSegments[pathSegments.length - 1];
  const accountingVoucher = accountingVoucherPaths.includes(lastSegment);

  return (
    <div className=" ">
      <TitleDiv
        title={"Select Party"}
        dropdownContents={[
          {
            title: "Add Customers",
            to: "/sUsers/addParty",
            from: accountingVoucher ? "accountingVoucher" : "commonVoucher",
          },
        ]}
      />
      <PartyListComponent isVoucher={true} />
    </div>
  );
}

export default SearchParty;
