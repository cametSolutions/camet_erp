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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import CustomBarLoader from "@/components/common/CustomBarLoader";

function AddOpening() {
  const [partyData, setPartyData] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredParty, setFilteredParty] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("add");

  // New bills for Add tab
  const [newBills, setNewBills] = useState([
    {
      date: new Date(),
      billNo: "",
      dueDate: new Date(),
      amount: "",
      classification: "Dr",
    },
  ]);

  // Existing bills for Edit tab
  const [existingBills, setExistingBills] = useState([]);

  const [totalAmount, setTotalAmount] = useState(0);
  const [classification, setClassification] = useState("Dr");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { data, loading, refreshHook } = useFetch(
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

  useEffect(() => {
    const fetchOpenings = async () => {
      if (selectedParty && selectedParty?._id) {
        try {
          setFetchLoading(true);
          const res = await api.get(
            `/api/sUsers/getPartyOpening/${cmp_id}/${selectedParty?.party_master_id}`,
            {
              withCredentials: true,
            }
          );

          if (res?.data?.data && res?.data?.data.length > 0) {
            setExistingBills(res?.data?.data);
            setHasExistingData(true);
            setActiveTab("edit"); // Switch to edit tab if data exists
          } else {
            setExistingBills([]);
            setHasExistingData(false);
            setActiveTab("add"); // Switch to add tab if no data exists
          }
        } catch (error) {
          console.log(error);
          setExistingBills([]);
          setHasExistingData(false);
        } finally {
          setFetchLoading(false);
        }
      }
    };
    fetchOpenings();
  }, [selectedParty, cmp_id]);

  useEffect(() => {
    if (activeTab === "add") {
      calculateTotal(newBills);
    } else {
      calculateTotal(existingBills);
    }
  }, [newBills, existingBills, activeTab]);

  const searchData = (data) => {
    setSearch(data);
  };

  const selectParty = (party) => {
    setSelectedParty(party);
    setOpenDialog(true);
    // Reset new bills when selecting a new party
    setNewBills([
      {
        date: new Date(),
        billNo: "",
        dueDate: new Date(),
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
    const lastBill = newBills[newBills.length - 1];

    if (lastBill) {
      // Check if any field in the last bill is empty
      const hasEmptyField = Object.values(lastBill).some(
        (value) => value === ""
      );

      if (hasEmptyField) {
        return; // Stop execution if any field is empty
      }
    }

    setNewBills([
      ...newBills,
      {
        date: new Date(),
        billNo: "",
        dueDate: new Date(),
        amount: "",
        classification: "Dr",
      },
    ]);
  };

  const handleRemoveNewBill = (index) => {
    const updatedBills = [...newBills];
    updatedBills.splice(index, 1);
    setNewBills(updatedBills);
  };

  const handleRemoveExistingBill = (index) => {
    const updatedBills = [...existingBills];
    updatedBills.splice(index, 1);
    setExistingBills(updatedBills);
  };

  const handleNewBillChange = (index, field, value) => {
    const updatedBills = [...newBills];

    if (field === "date" || field === "dueDate") {
      updatedBills[index][field] = value;
    } else if (field === "amount") {
      // Handle amount as a number
      updatedBills[index][field] = value === "" ? "" : parseFloat(value);
    } else {
      updatedBills[index][field] = value;
    }

    setNewBills(updatedBills);
  };

  const handleExistingBillChange = (index, field, value) => {
    const updatedBills = [...existingBills];

    if (field === "date" || field === "dueDate") {
      updatedBills[index][field] = value;
    } else if (field === "amount") {
      // Handle amount as a number
      updatedBills[index][field] = value === "" ? "" : parseFloat(value);
    } else {
      updatedBills[index][field] = value;
    }

    setExistingBills(updatedBills);
  };

  const calculateTotal = (billsArray) => {
    if (!billsArray || billsArray.length === 0) {
      setTotalAmount(0);
      setClassification(null);
      return;
    }

    let classificationTotal = billsArray.reduce(
      (acc, bill) => {
        const amount = parseFloat(bill.amount) || 0;

        acc.total += amount;

        if (bill.classification === "Dr") {
          acc.DrTotal += amount;
        } else if (bill.classification === "Cr") {
          acc.CrTotal += amount;
        }

        return acc;
      },
      { total: 0, DrTotal: 0, CrTotal: 0 }
    );

    setClassification(
      classificationTotal.DrTotal > classificationTotal.CrTotal ? "Dr" : "Cr"
    );

    setTotalAmount(classificationTotal.total);
  };

  const handleAddSubmit = async () => {
    const hasEmptyField = newBills.some((bill) =>
      Object.values(bill).some((value) => value === "")
    );

    if (hasEmptyField) {
      toast.error("Please fill all the fields");
      return;
    }

    const formData = {
      party: selectedParty,
      bills: newBills,
      classification: classification,
    };

    try {
      setFetchLoading(true);
      const res = await api.post(
        `/api/sUsers/addPartyOpening/${cmp_id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success("Opening balance added successfully");
      refreshHook();
      handleCloseDialog();
    } catch (error) {
      if (error?.response?.data?.conflictingBills?.length > 0) {
        window.alert("Conflicting bills found for this party such as : \n\n" + error?.response?.data?.conflictingBills?.join(","));
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
        console.log(error?.response?.data);
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    const hasEmptyField = existingBills.some((bill) =>
      Object.values(bill).some((value) => value === "")
    );

    if (hasEmptyField) {
      toast.error("Please fill all the fields");
      return;
    }

    const formData = {
      party: selectedParty,
      bills: existingBills,
      classification: classification,
    };

    try {
      setFetchLoading(true);
      const res = await api.put(
        `/api/sUsers/editPartyOpening/${cmp_id}/${selectedParty?.party_master_id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success("Opening balance updated successfully");
      refreshHook();
      handleCloseDialog();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.log(error);
    } finally {
      setFetchLoading(false);
    }
  };

  // Renders bill rows for either add or edit tab
  const renderBillRows = (bills, handleChange, handleRemove, isEditMode) => {
    return bills.map((bill, index) => (
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
                    format(new Date(bill.date), "dd/MM/yyyy")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(bill.date)}
                  onSelect={(date) => handleChange(index, "date", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <div className="text-sm font-medium">Bill No:</div>
            <Input
              value={bill.billNo}
              onChange={(e) => handleChange(index, "billNo", e.target.value)}
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
                    format(new Date(bill.dueDate), "dd/MM/yyyy")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(bill.dueDate)}
                  onSelect={(date) => handleChange(index, "dueDate", date)}
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
              onChange={(e) => handleChange(index, "amount", e.target.value)}
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
                  handleChange(index, "classification", e.target.value)
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
                  onClick={() => handleRemove(index)}
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
                  format(new Date(bill.date), "dd/MM/yyyy")
                ) : (
                  <span>Select date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(bill.date)}
                onSelect={(date) => handleChange(index, "date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="hidden md:block col-span-1">
          <Input
            value={bill.billNo}
            onChange={(e) => handleChange(index, "billNo", e.target.value)}
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
                  format(new Date(bill.dueDate), "dd/MM/yyyy")
                ) : (
                  <span>Select date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(bill.dueDate)}
                onSelect={(date) => handleChange(index, "dueDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="hidden md:block col-span-1">
          <Input
            type="number"
            value={bill.amount}
            onChange={(e) => handleChange(index, "amount", e.target.value)}
            placeholder="Amount"
            className="w-full"
          />
        </div>

        <div className="hidden md:flex col-span-1">
          <select
            value={bill.classification}
            onChange={(e) =>
              handleChange(index, "classification", e.target.value)
            }
            className="w-full p-2 border rounded"
          >
            <option value="Dr">Dr</option>
            <option value="Cr">Cr</option>
          </select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(index)}
            className="ml-2 h-9 w-9"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ));
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

      {/* Dialog with tabs for adding/editing opening balance */}
      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent
          className={`${
            fetchLoading && "pointer-events-none opacity-70"
          } sm:max-w-5xl max-w-[92vw] mx-auto`}
        >
          {fetchLoading && <CustomBarLoader />}
          <DialogHeader className="px-2 sm:px-4">
            <DialogTitle className="text-base sm:text-lg break-words">
              Bill-wise Breakup of: {selectedParty?.partyName}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full mb-4">
              <TabsTrigger value="add" className="flex-1">
                Add New Bills
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                className="flex-1"
                disabled={!hasExistingData}
              >
                Edit Existing Bills
              </TabsTrigger>
            </TabsList>

            {/* Add New Bills Tab */}
            <TabsContent value="add" className="w-full">
              <div className="overflow-y-auto max-h-[60vh] px-2 sm:px-4">
                {/* Header row - hide on mobile */}
                <div className="hidden md:grid grid-cols-5 gap-4 p-2 bg-gray-100 font-medium text-sm">
                  <div className="col-span-1">Date</div>
                  <div className="col-span-1">Bill No</div>
                  <div className="col-span-1">Due Date</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-1">Dr/Cr</div>
                </div>

                {/* Bill rows for Add tab */}
                {renderBillRows(
                  newBills,
                  handleNewBillChange,
                  handleRemoveNewBill,
                  false
                )}

                {/* Add more button - only in Add tab */}
                <Button
                  variant="ghost"
                  onClick={handleAddBill}
                  className="w-full mt-4 flex items-center justify-center text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Bill
                </Button>
              </div>

              {/* Total summary */}
              <div className="p-2 sm:p-4 border-t mt-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">On Account:</div>
                  <div className="font-bold">
                    ₹ {totalAmount.toFixed(2)}
                  </div>
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
                <Button
                  disabled={loading || fetchLoading}
                  onClick={handleAddSubmit}
                  className="w-full sm:w-auto"
                >
                  Submit
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* Edit Existing Bills Tab */}
            <TabsContent value="edit" className="w-full">
              <div className="overflow-y-auto max-h-[60vh] px-2 sm:px-4">
                {/* Header row - hide on mobile */}
                <div className="hidden md:grid grid-cols-5 gap-4 p-2 bg-gray-100 font-medium text-sm">
                  <div className="col-span-1">Date</div>
                  <div className="col-span-1">Bill No</div>
                  <div className="col-span-1">Due Date</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-1">Dr/Cr</div>
                </div>

                {/* Bill rows for Edit tab */}
                {existingBills.length > 0 ? (
                  renderBillRows(
                    existingBills,
                    handleExistingBillChange,
                    handleRemoveExistingBill,
                    true
                  )
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No existing bills found
                  </div>
                )}
              </div>

              {/* Total summary */}
              <div className="p-2 sm:p-4 border-t mt-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">On Account:</div>
                  <div className="font-bold">
                    ₹ {totalAmount.toFixed(2)} 
                  </div>
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
                <Button
                  disabled={
                    loading || fetchLoading 
                  }
                  onClick={handleEditSubmit}
                  className="w-full sm:w-auto"
                >
                  Update
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddOpening;
