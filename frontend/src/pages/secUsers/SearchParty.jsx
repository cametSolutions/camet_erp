import PartyListComponent from "@/pages/masters/party/PartyListComponent";
import TitleDiv from "@/components/common/TitleDiv";

function SearchParty() {
  return (
    <div className=" ">
      <TitleDiv title={"Select Party"} />
      <PartyListComponent isVoucher={true} />
    </div>
  );
}

export default SearchParty;
