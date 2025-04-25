import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { setPriceLevel } from "../../../../slices/voucherSlices/commonVoucherSlice";
import { useDispatch, useSelector } from "react-redux";

export default function FilterContent() {
  const dispatch = useDispatch();
  const { selectedPriceLevel, priceLevels, vanSaleGodown, voucherType } =
    useSelector((state) => state.commonVoucherSlice);

  console.log(vanSaleGodown, voucherType);

  const [accordionValue, setAccordionValue] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Keep the accordion open if a price level is selected
  useEffect(() => {
    if (selectedPriceLevel !== "") {
      setAccordionValue("item-1");
    }
  }, [selectedPriceLevel]);

  const handlePriceLevelSelection = (pricelevel) => {
    dispatch(setPriceLevel(pricelevel));
    setIsSheetOpen(false);
  };

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={setIsSheetOpen}
      className="!h-screen !overflow-y-scroll"
    >
      <SheetTrigger className="flex items-center gap-2 text-xs font-bold text-gray-500">
        <aside>
          <IoFilterSharp className="" />
        </aside>
        <p> Filter</p>
      </SheetTrigger>
      <SheetContent className="!h-screen !overflow-y-scroll p-0">
        <SheetTitle className="p-5">Filter Your Products</SheetTitle>

        {voucherType === "vanSale" && (
          <SheetHeader>
            <SheetDescription className="text-xs font-bold px-5 py-1  text-gray-600 bg-gray-100">
              Godown:{" "}
              {(vanSaleGodown?.godownName.length > 15
                ? vanSaleGodown?.godownName.slice(0, 15) + "..."
                : vanSaleGodown?.godownName) || "No Godown Configured"}
            </SheetDescription>
          </SheetHeader>
        )}

        <div className="p-5">
          {/* Price Levels Accordion */}
          <Accordion
            className=""
            type="single"
            collapsible
            value={accordionValue}
            onValueChange={setAccordionValue}
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>Price Levels</AccordionTrigger>
              {priceLevels?.map((level, index) => (
                <AccordionContent key={index}>
                  <div
                    onClick={() => handlePriceLevelSelection(level)}
                    className={` ${
                      selectedPriceLevel === level ? "bg-slate-200" : ""
                    } hover:bg-slate-200 mb-1 p-2 cursor-pointer`}
                  >
                    {level?.name}
                  </div>
                </AccordionContent>
              ))}
            </AccordionItem>
          </Accordion>

          {/* Other Filters */}
          <Accordion disabled type="single" collapsible>
            <AccordionItem value="item-2">
              <AccordionTrigger>Brand</AccordionTrigger>
              <AccordionContent>
                {/* Add your brand selection logic here */}
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion disabled type="single" collapsible>
            <AccordionItem value="item-3">
              <AccordionTrigger>Category</AccordionTrigger>
              <AccordionContent>
                {/* Add your category selection logic here */}
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion disabled type="single" collapsible>
            <AccordionItem value="item-4">
              <AccordionTrigger>Subcategory</AccordionTrigger>
              <AccordionContent>
                {/* Add your subcategory selection logic here */}
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
