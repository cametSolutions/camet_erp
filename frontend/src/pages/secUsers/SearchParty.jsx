import PartyListComponent from "@/components/common/List/PartyListComponent";
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
