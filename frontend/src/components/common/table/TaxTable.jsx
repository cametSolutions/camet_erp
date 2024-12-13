/* eslint-disable react/prop-types */
import  { useMemo } from "react";

const TaxTable = ({ products }) => {
  const consolidatedTaxData = useMemo(() => {
    if (products && products.length > 0) {
      const taxData = products.reduce((acc, product) => {
        const taxKey = product.igst > 0 ? product?.igst : product?.cgst + product?.sgst;

        if (!acc[taxKey]) {
          acc[taxKey] = {
            taxRate: taxKey,
            taxableAmt: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            total: 0,
          };
        }

        acc[taxKey].taxableAmt += product?.subTotal || 0;
        acc[taxKey].cgst += Number(product?.cgstAmt) || 0;
        acc[taxKey].sgst +=Number( product?.sgstAmt) || 0;
        acc[taxKey].igst += Number(product?.igstAmt) || 0;
        acc[taxKey].total += Number(product?.total) || 0;

        return acc;
      }, {});

      return Object?.values(taxData);
    }
    return [];
  }, [products]);


  console.log("consolidatedTaxData", consolidatedTaxData);
  

  return (
    <div className="flex justify-between ">
      {consolidatedTaxData?.length === 0 ? (
        <div></div>
      ) : (
        <div className="w-[40%]">
          <table className="w-full text-gray-700 text-[7px]">
            <thead>
              <tr>
                <th className="p-1">TAX %</th>
                <th className="p-1">Taxable Amt</th>
                <th className="p-1">CGST</th>
                <th className="p-1">SGST</th>
                <th className="p-1">IGST</th>
                <th className="p-1">TOTAL</th>
              </tr>
            </thead>
            <tbody className="text-[6px]">
              {consolidatedTaxData.map((tax, index) => (
                <tr key={index}>
                  <td className="p-1 text-center">{tax?.taxRate}</td>
                  <td className="p-1 text-right">{tax?.taxableAmt?.toFixed(2)}</td>
                  <td className="p-1 text-right">{tax?.cgst?.toFixed(2)}</td>
                  <td className="p-1 text-right">{tax?.sgst?.toFixed(2)}</td>
                  <td className="p-1 text-right">{tax?.igst?.toFixed(2)}</td>
                  <td className="p-1 text-right">{tax?.total?.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td className="p-1 font-bold">Total</td>
                <td className="p-1 text-right font-bold">
                  {consolidatedTaxData
                    ?.reduce((sum, tax) => sum + tax?.taxableAmt, 0)
                    ?.toFixed(2)}
                </td>
                <td className="p-1 text-right font-bold">
                  {consolidatedTaxData
                    ?.reduce((sum, tax) => sum + tax?.cgst, 0)
                    ?.toFixed(2)}
                </td>
                <td className="p-1 text-right font-bold">
                  {consolidatedTaxData
                    ?.reduce((sum, tax) => sum + tax?.sgst, 0)
                    ?.toFixed(2)}
                </td>
                <td className="p-1 text-right font-bold">
                  {consolidatedTaxData
                    ?.reduce((sum, tax) => sum + tax?.igst, 0)
                    ?.toFixed(2)}
                </td>
                <td className="p-1 text-right font-bold">
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
