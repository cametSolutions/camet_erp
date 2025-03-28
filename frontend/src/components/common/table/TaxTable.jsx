/* eslint-disable react/prop-types */
import { useMemo } from "react";

const TaxTable = ({ products, org = {}, party = {} }) => {
  // New variable to handle state comparison
  const isSameState = org?.state === party?.state || !party?.state;

  const consolidatedTaxData = useMemo(() => {
    if (products && products.length > 0) {
      const taxData = products.reduce((acc, product) => {
        const taxKey =
          product.igst > 0 ? product?.igst : product?.cgst + product?.sgst;
        const cessKey = product?.cess || 0;
        const addlCessKey = product?.addl_cess || 0;
        const unit=product?.unit

        // Create a unique key combining tax rate and cess
        const uniqueKey = `${taxKey}_${cessKey}_${addlCessKey}`;

        if (!acc[uniqueKey]) {
          acc[uniqueKey] = {
            taxRate: taxKey,
            cessRate: cessKey,
            addlCessRate: addlCessKey,
            taxableAmt: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            cess: 0,
            addlCess: 0,
            total: 0,
            unit
          };
        }

        acc[uniqueKey].taxableAmt += product?.subTotal || 0;
        acc[uniqueKey].cgst += Number(product?.cgstAmt) || 0;
        acc[uniqueKey].sgst += Number(product?.sgstAmt) || 0;
        acc[uniqueKey].igst += Number(product?.igstAmt) || 0;
        acc[uniqueKey].cess += Number(product?.cessAmt || 0);
        acc[uniqueKey].addlCess += Number(product?.addl_cessAmt || 0);
        acc[uniqueKey].total += Number(product?.total) || 0;
        acc[uniqueKey].unit=product?.unit

        return acc;
      }, {});

      // Sort the tax data by tax rate to ensure adjacency
      return Object.values(taxData).sort((a, b) => a.taxRate - b.taxRate);
    }
    return [];
  }, [products]);

  console.log(consolidatedTaxData);
  

  return (
    <div className="flex justify-between">
      {consolidatedTaxData?.length === 0 ? (
        <div></div>
      ) : (
        <div className="">
          <table className="w-full text-gray-700 text-[9px] border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-0.5 border border-gray-300">TAX %</th>
                <th className="p-0.5 border border-gray-300">CESS %</th>
                {/* <th className="p-0.5 border border-gray-300">Addl. CESS %</th> */}
                <th className="p-0.5 border border-gray-300">Taxable Amt</th>
                {isSameState ? (
                  <>
                    <th className="p-0.5 border border-gray-300">CGST</th>
                    <th className="p-0.5 border border-gray-300">SGST</th>
                  </>
                ) : (
                  <th className="p-0.5 border border-gray-300">IGST</th>
                )}
                <th className="p-0.5 border border-gray-300">CESS</th>
                <th className="p-0.5 border border-gray-300">Addl. CESS</th>
                <th className="p-0.5 border border-gray-300">TOTAL</th>
              </tr>
            </thead>
            <tbody className="text-[9px]">
              {consolidatedTaxData.map((tax, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-0.5 text-center border border-gray-300">
                    {tax?.taxRate}
                  </td>
                  <td className="p-0.5 text-center border border-gray-300">
                    {tax?.cessRate} & {tax?.addlCessRate}/{tax?.unit}
                  </td>
                  {/* <td className="p-0.5 text-center border border-gray-300">
                    {tax?.addlCessRate}
                  </td> */}
                  <td className="p-0.5 text-right border border-gray-300">
                    {tax?.taxableAmt?.toFixed(2)}
                  </td>
                  {isSameState ? (
                    <>
                      <td className="p-0.5 text-right border border-gray-300">
                        {tax?.cgst?.toFixed(2)}
                      </td>
                      <td className="p-0.5 text-right border border-gray-300">
                        {tax?.sgst?.toFixed(2)}
                      </td>
                    </>
                  ) : (
                    <td className="p-0.5 text-right border border-gray-300">
                      {tax?.igst?.toFixed(2)}
                    </td>
                  )}
                  <td className="p-0.5 text-right border border-gray-300">
                    {tax?.cess?.toFixed(2) }
                  </td>
                  <td className="p-0.5 text-right border border-gray-300">
                    {tax?.addlCess?.toFixed(2)}
                  </td>
                  <td className="p-0.5 text-right border border-gray-300">
                    {tax?.total?.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="p-0.5 border border-gray-300">Total</td>
                {/* <td className="p-0.5 border border-gray-300"></td> */}
                <td className="p-0.5 border border-gray-300"></td>
                <td className="p-0.5 text-right border border-gray-300">
                  {consolidatedTaxData
                    ?.reduce((sum, tax) => sum + tax?.taxableAmt, 0)
                    ?.toFixed(2)}
                </td>

                {isSameState ? (
                  <>
                    <td className="p-0.5 text-right border border-gray-300">
                      {consolidatedTaxData
                        ?.reduce((sum, tax) => sum + tax?.cgst, 0)
                        ?.toFixed(2)}
                    </td>
                    <td className="p-0.5 text-right border border-gray-300">
                      {consolidatedTaxData
                        ?.reduce((sum, tax) => sum + tax?.sgst, 0)
                        ?.toFixed(2)}
                    </td>
                  </>
                ) : (
                  <td className="p-0.5 text-right border border-gray-300">
                    {consolidatedTaxData
                      ?.reduce((sum, tax) => sum + tax?.igst, 0)
                      ?.toFixed(2)}
                  </td>
                )}

                <td className="p-0.5 text-right border border-gray-300">
                  {consolidatedTaxData
                    ?.reduce((sum, tax) => sum + tax?.cess, 0)
                    ?.toFixed(2)}
                </td>
                <td className="p-0.5 text-right border border-gray-300">
                  {consolidatedTaxData
                    ?.reduce((sum, tax) => sum + tax?.addlCess, 0)
                    ?.toFixed(2)}
                </td>

                <td className="p-0.5 text-right border border-gray-300">
                  {consolidatedTaxData
                    ?.reduce((sum, tax) => sum + tax?.total, 0)
                    ?.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaxTable;