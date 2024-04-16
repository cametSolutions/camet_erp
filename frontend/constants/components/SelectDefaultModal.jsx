/* eslint-disable react/prop-types */
import { Button, Label, Modal, Select} from "flowbite-react";
import { useEffect, useState } from "react";
import { setPriceLevel } from "../../slices/sales";
import { useDispatch } from "react-redux";

function SelectDefaultModal({ pricelevels }) {
  console.log(pricelevels);

  const [openModal, setOpenModal] = useState(false);
  const [priceLevels, setPriceLevels] = useState(""); // State for selected price level
  const [godown, setGodown] = useState(""); // State for selected godown
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit button's disabled state
  const [selectedPriceLevel, setSelectedPriceLevel] = useState(priceLevels[0]);

  useEffect(() => {
    setPriceLevels(pricelevels);
  }, []);

  // Example data for selects
  //   const priceLevels = ["WHOLESALE PRICE", "RETAIL PRICE", "INSTITUTION PRICE"];
  const godowns = ["STAR BOTTLES", "Star Bottles Godown 1/I", "V Godown"];
  const dispatch = useDispatch();

  function onCloseModal() {
    setOpenModal(false);
    setPriceLevel("");
    setGodown("");
    setIsSubmitting(false);
  }

  function handleSubmit() {
    setIsSubmitting(true);
    // Handle form submission logic here
    // After submission, you might want to close the modal and reset the form
    onCloseModal();
  }

  const handlePriceLevelChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedPriceLevel(selectedValue);
    dispatch(setPriceLevel(selectedValue));
  };

  return (
    <div>
      {" "}
      <Button onClick={() => setOpenModal(true)}>Set Values</Button>
      <Modal show={openModal} size="md" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Sign in to our platform
            </h3>
            <div></div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="priceLevel" value="Default Price Level" />
              </div>
              <Select
                id="priceLevel"
                value={selectedPriceLevel}
                onChange={(e) => handlePriceLevelChange(e)}
                required
              >
                {priceLevels?.length > 0 &&
                  priceLevels?.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="godown" value="Default Godown" />
              </div>
              <Select
                id="godown"
                value={godown}
                onChange={(event) => setGodown(event.target.value)}
                required
              >
                {godowns.map((godown) => (
                  <option key={godown} value={godown}>
                    {godown}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-full">
              <Button disabled={isSubmitting} onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default SelectDefaultModal;
