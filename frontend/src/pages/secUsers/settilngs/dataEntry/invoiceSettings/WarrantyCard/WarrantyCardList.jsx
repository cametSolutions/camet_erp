import TitleDiv from "@/components/common/TitleDiv";

const WarrantyCardList = () => {
  return (
    <div>
      <TitleDiv
        title={"Warranty Card List"}
        dropdownContents={[
          {
            title: "Add Warranty Cards",
            to: "/sUsers/addWarrantyCard",
          },
        ]}
      />
    </div>
  );
};

export default WarrantyCardList;
