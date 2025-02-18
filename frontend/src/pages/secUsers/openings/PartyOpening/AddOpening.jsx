import SearchBar from "@/components/common/SearchBar";
import TitleDiv from "@/components/common/TitleDiv";
import useFetch from "@/customHook/useFetch";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { toast } from "react-toastify";

function AddOpening() {
  const [partyData, setPartyData] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredParty, setFilteredParty] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [bills, setBills] = useState([
    {
      date: new Date(),
      billNo: "",
      dueDate: new Date(),
      // dueDays: 0,
      amount: "",
      classification: "Dr",
    },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [classification, setClassification] = useState("Dr");

  console.log(bills);

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { data, loading } = useFetch(
    `/api/sUsers/PartyList/${cmp_id}?outstanding=true&voucher=opening`
  );

  useEffect(() => {
    if (data) {
      setPartyData(data?.partyList);
      setFilteredParty(data?.partyList);
    }
  }, [data]);

  useEffect(() => {
    if (search === "") {
      setFilteredParty(partyData);
    } else {
      const filtered = partyData?.filter((el) =>
        el?.partyName?.toLowerCase()?.includes(search?.toLowerCase())
      );
      setFilteredParty(filtered);
    }
  }, [search, partyData]);

  const searchData = (data) => {
    setSearch(data);
  };

  const selectParty = (party) => {
    setSelectedParty(party);
    setOpenDialog(true);
    // Reset bills when selecting a new party
    setBills([
      {
        date: new Date(),
        billNo: "",
        dueDate: new Date(),
        // dueDays: 0,
        amount: "",
        classification: "Dr",
      },
    ]);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedParty(null);
  };

  const handleAddBill = () => {
    const lastBill = bills[bills.length - 1];

    if (lastBill) {
      // Check if any field in the last bill is empty
      const hasEmptyField = Object.values(lastBill).some(
        (value) => value === ""
      );

      if (hasEmptyField) {
        return; // Stop execution if any field is empty
      }
    }

    setBills([
      ...bills,
      {
        date: new Date(),
        billNo: "",
        dueDate: new Date(),
        // dueDays: 0,
        amount: "",
        classification: "Dr",
      },
    ]);
  };

  const handleRemoveBill = (index) => {
    const updatedBills = [...bills];
    updatedBills.splice(index, 1);
    setBills(updatedBills);
    calculateTotal(updatedBills);
  };

  const handleBillChange = (index, field, value) => {
    const updatedBills = [...bills];

    if (field === "date" || field === "dueDate") {
      updatedBills[index][field] = value;

      // Recalculate due days when either date changes
      // if (field === "date") {
      //   const dueDays = Math.floor(
      //     (updatedBills[index].dueDate - value) / (1000 * 60 * 60 * 24)
      //   );
      //   updatedBills[index].dueDays = dueDays > 0 ? dueDays : 0;
      // } else if (field === "dueDate") {
      //   const dueDays = Math.floor(
      //     (value - updatedBills[index].date) / (1000 * 60 * 60 * 24)
      //   );
      //   updatedBills[index].dueDays = dueDays > 0 ? dueDays : 0;
      // }
    } else if (field === "amount") {
      // Handle amount as a number
      updatedBills[index][field] = value === "" ? "" : parseFloat(value);
    } else {
      updatedBills[index][field] = value;
    }

    setBills(updatedBills);
    calculateTotal(updatedBills);
  };

  const calculateTotal = (billsArray) => {
    console.log(billsArray);

    const total = billsArray.reduce((sum, bill) => {
      const amount = parseFloat(bill.amount) || 0;
      return sum + amount;
    }, 0);

    let classificationTotal = {
      DrTotal: 0,
      CrTotal: 0,
    };

    billsArray.reduce((sum, bill) => {
      if (bill.classification === "Dr") {
        const amount = parseFloat(bill.amount) || 0;
        classificationTotal.DrTotal += amount;
      } else if (bill.classification === "Cr") {
        const amount = parseFloat(bill.amount) || 0;
        classificationTotal.CrTotal += amount;
      }
    });

    console.log(classificationTotal);
    if (classificationTotal.DrTotal > classificationTotal.CrTotal) {
      setClassification("Dr");
    } else {
      setClassification("Cr");
    }

    setTotalAmount(total);
  };

  const handleSubmit = () => {
    // TODO: Implement submission logic to your API
    // This would send the bills data to your backend

    // console.log("Submitting opening balance for:", selectedParty);
    // console.log("Bills:", bills);

    bills.forEach((bill) => {
      const hasEmptyField = Object.values(bill).some((value) => value === "");
      if (hasEmptyField) {
        toast.error("Please fill all the fields");
      }
    });

    const formData = {
      party: selectedParty,
      bills: bills,
    };

    console.log(formData);

    // After submission, close the dialog
    // handleCloseDialog();
  };

  return (
    <div>
      <header className="sticky top-0 z-50">
        <TitleDiv
          title={"Add Opening"}
          from="/sUsers/partyList"
          loading={loading}
        />
        <SearchBar onType={searchData} />
      </header>

      <section>
        {filteredParty?.length > 0 && !loading ? (
          // Show party list if parties are available
          filteredParty.map((el, index) => (
            <div
              onClick={() => selectParty(el)}
              key={index}
              className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex justify-between mx-2 rounded-sm cursor-pointer hover:bg-slate-100"
            >
              <section>
                <p className="font-bold">{el?.partyName}</p>
                <p className="font-medium text-gray-500 text-sm">
                  Click to add opening balance
                </p>
              </section>
              {el?.totalOutstanding && el?.totalOutstanding > 0 && (
                <section>
                  <p className="font-medium text-gray-500 text-md mr-3 flex items-center gap-2">
                    {el.totalOutstanding}
                  </p>
                </section>
              )}
            </div>
          ))
        ) : (
          // Show message if no parties are available or if loading
          <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
            {loading ? "Loading..." : "No Parties !!!"}
          </div>
        )}
      </section>

      {/* Dialog for adding opening balance */}
      {/* Dialog for adding opening balance */}
      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-5xl max-w-[92vw] mx-auto ">
          <DialogHeader className="px-2 sm:px-4 ">
            <DialogTitle className="text-base sm:text-lg break-words ">
              Bill-wise Breakup of: {selectedParty?.partyName}
            </DialogTitle>
            {/* <div className="mt-2 text-sm text-gray-500">
        Upto ₹ {totalAmount.toFixed(2)} Dr
      </div> */}
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] px-2 sm:px-4">
            {/* Header row - hide on mobile */}
            <div className="hidden md:grid grid-cols-5 gap-4 p-2 bg-gray-100 font-medium text-sm">
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Bill No</div>
              <div className="col-span-1">Due Date</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-1">Dr/Cr</div>
            </div>

            {/* Bill rows */}
            {bills.map((bill, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 p-2 border-b items-center"
              >
                {/* Mobile labels + inputs */}
                <div className="block md:hidden space-y-4">
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="text-sm font-medium">Date:</div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bill.date ? (
                            format(bill.date, "dd/MM/yyyy")
                          ) : (
                            <span>Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={bill.date}
                          onSelect={(date) =>
                            handleBillChange(index, "date", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="text-sm font-medium">Bill No:</div>
                    <Input
                      value={bill.billNo}
                      onChange={(e) =>
                        handleBillChange(index, "billNo", e.target.value)
                      }
                      placeholder="Bill No"
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="text-sm font-medium">Due Date:</div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bill.dueDate ? (
                            format(bill.dueDate, "dd/MM/yyyy")
                          ) : (
                            <span>Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={bill.dueDate}
                          onSelect={(date) =>
                            handleBillChange(index, "dueDate", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="text-sm font-medium">Amount:</div>
                    <Input
                      type="number"
                      value={bill.amount}
                      onChange={(e) =>
                        handleBillChange(index, "amount", e.target.value)
                      }
                      placeholder="Amount"
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="text-sm font-medium">Dr/Cr:</div>
                    <div className="flex w-full">
                      <select
                        value={bill.classification}
                        onChange={(e) =>
                          handleBillChange(
                            index,
                            "classification",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded"
                      >
                        <option value="Dr">Dr</option>
                        <option value="Cr">Cr</option>
                      </select>

                      {bills.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveBill(index)}
                          className="ml-2 h-9 w-9"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop view - hidden on mobile */}
                <div className="hidden md:block col-span-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {bill.date ? (
                          format(bill.date, "dd/MM/yyyy")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={bill.date}
                        onSelect={(date) =>
                          handleBillChange(index, "date", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="hidden md:block col-span-1">
                  <Input
                    value={bill.billNo}
                    onChange={(e) =>
                      handleBillChange(index, "billNo", e.target.value)
                    }
                    placeholder="Bill No"
                    className="w-full"
                  />
                </div>

                <div className="hidden md:block col-span-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {bill.dueDate ? (
                          format(bill.dueDate, "dd/MM/yyyy")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={bill.dueDate}
                        onSelect={(date) =>
                          handleBillChange(index, "dueDate", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="hidden md:block col-span-1">
                  <Input
                    type="number"
                    value={bill.amount}
                    onChange={(e) =>
                      handleBillChange(index, "amount", e.target.value)
                    }
                    placeholder="Amount"
                    className="w-full"
                  />
                </div>

                <div className="hidden md:flex  col-span-1 ">
                  <select
                    value={bill.classification}
                    onChange={(e) =>
                      handleBillChange(index, "classification", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="Dr">Dr</option>
                    <option value="Cr">Cr</option>
                  </select>

                  {bills.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveBill(index)}
                      className="ml-2 h-9 w-9"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Add more button */}
            <Button
              variant="ghost"
              onClick={handleAddBill}
              className="w-full mt-4 flex items-center justify-center text-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Another Bill
            </Button>
          </div>

          {/* Total summary */}
          <div className="p-2 sm:p-4 border-t mt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">On Account:</div>
              <div className="font-bold">₹ {totalAmount.toFixed(2)} </div>
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddOpening;
