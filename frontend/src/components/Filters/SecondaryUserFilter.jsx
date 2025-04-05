import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IoFilterSharp } from "react-icons/io5";
import useFetch from "@/customHook/useFetch";
import { Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../../../slices/filterSlices/userFilter";
import { useState } from "react";

export default function SecondaryUserFilter() {
  const { data: apiData, loading } = useFetch(
    `/api/sUsers/fetchSecondaryUsers`
  );

  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const selectedSecondaryUser = useSelector(
    (state) => state?.userFilter?.selectedUser
  );


  const HandleUserSelection = (user) => {
    if (user !== "all") {
      const { _id, name } = user;
      dispatch(setSelectedUser({ _id, name }));
    } else {
      dispatch(setSelectedUser(null));
    }

    // ✅ Close the sheet after selection
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} className="!h-screen !overflow-y-scroll">
      <SheetTrigger
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs font-bold text-gray-500"
      >
        <aside>
          <IoFilterSharp />
        </aside>
        <p>Filter</p>
      </SheetTrigger>

      <SheetContent
        className={`${loading ? "opacity-70" : ""} !h-screen !overflow-y-scroll`}
      >
        <SheetHeader>
          <SheetTitle>Filter Your Transactions</SheetTitle>

          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <Loader className="animate-spin" />
            </div>
          ) : (
            <Accordion type="single" collapsible>
              <AccordionItem value="item-2">
                <AccordionTrigger>Users</AccordionTrigger>

                {apiData?.secondaryUsers?.length > 0 ? (
                  <>
                    {/* "All" option */}
                    <AccordionContent>
                      <div
                        onClick={() => HandleUserSelection("all")}
                        className={` ${!selectedSecondaryUser && "bg-slate-200"}     hover:bg-slate-200 mb-1 p-2 cursor-pointer`}
                      >
                        All
                      </div>
                    </AccordionContent>

                    {/* List of users */}
                    {apiData.secondaryUsers.map((user) => (
                      <AccordionContent key={user._id}>
                        <div
                          onClick={() => HandleUserSelection(user)}
                          className={`hover:bg-slate-200 mb-1 p-2 cursor-pointer  ${
                            selectedSecondaryUser?._id === user._id
                              ? "bg-slate-200"
                              : ""
                          }`}
                        >
                          {user.name.length > 20
                            ? user.name.slice(0, 20) + "..."
                            : user.name}
                        </div>
                      </AccordionContent>
                    ))}
                  </>
                ) : (
                  <AccordionContent>
                    <div className="hover:bg-slate-200 mb-1 p-2 cursor-pointer">
                      No User Found
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            </Accordion>
          )}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
