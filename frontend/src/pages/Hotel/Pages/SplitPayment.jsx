import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

/**
 * SplitPayment Component
 * 
 * @param {Array} customers - List of customer objects with _id and partyName
 * @param {Object} cashOrBank - Object containing cashDetails and bankDetails arrays
 * @param {Number} totalAmount - Total amount to be split
 * @param {Function} onChange - Callback when split data changes
 * @param {Array} initialRows - Initial split payment rows (optional)
 */
const SplitPayment = ({ 
  customers = [], 
  cashOrBank = { cashDetails: [], bankDetails: [] },
  totalAmount = 0, 
  onChange,
  initialRows = null 
}) => {
  const [splitPaymentRows, setSplitPaymentRows] = useState(
    initialRows || [{ customer: customers[0]?._id, paymentMethod: '', sourceId: '', amount: '' }]
  );

  // Combine cash and bank sources
  const combinedSources = [
    ...(cashOrBank.cashDetails || []).map((cash) => ({
      id: cash._id,
      name: cash.partyName,
      type: 'cash'
    })),
    ...(cashOrBank.bankDetails || []).map((bank) => ({
      id: bank._id,
      name: bank.partyName,
      type: 'bank'
    }))
  ];

  // Update parent component whenever rows change
  useEffect(() => {
    const totalSplitAmount = splitPaymentRows.reduce(
      (sum, row) => sum + (parseFloat(row.amount) || 0),
      0
    );

    const hasInvalidRows = splitPaymentRows.some(
      (row) => !row.customer || !row.sourceId || !row.amount || parseFloat(row.amount) <= 0
    );

    // Calculate cash and online totals
    let totalCash = 0;
    let totalOnline = 0;

    splitPaymentRows.forEach((row) => {
      const amount = parseFloat(row.amount) || 0;
      if (row.paymentMethod === 'cash') {
        totalCash += amount;
      } else if (row.paymentMethod === 'card') {
        totalOnline += amount;
      }
    });

    // Prepare payment data in the format expected by the parent
    const payments = splitPaymentRows
      .filter(row => row.sourceId && parseFloat(row.amount) > 0)
      .map(row => {
        const source = combinedSources.find(s => s.id === row.sourceId);
        return {
          customerId: row.customer,
          method: row.paymentMethod,
          amount: parseFloat(row.amount),
          accountId: row.sourceId,
          accountName: source ? source.name : ''
        };
      });

    // Send data to parent
    if (onChange) {
      onChange({
        rows: splitPaymentRows,
        payments,
        totalCash,
        totalOnline,
        totalSplitAmount,
        isValid: !hasInvalidRows && totalSplitAmount === totalAmount,
        error: totalSplitAmount !== totalAmount ? 'Split payment amounts must equal the total amount.' : ''
      });
    }
  }, [splitPaymentRows, totalAmount, onChange, combinedSources]);

  const addSplitPaymentRow = () => {
    setSplitPaymentRows([
      ...splitPaymentRows,
      { customer: '', paymentMethod: '', sourceId: '', amount: '' }
    ]);
  };

  const removeSplitPaymentRow = (index) => {
    if (splitPaymentRows.length > 1) {
      const updatedRows = splitPaymentRows.filter((_, i) => i !== index);
      setSplitPaymentRows(updatedRows);
    }
  };

  const updateSplitPaymentRow = (index, field, value) => {
    const updatedRows = [...splitPaymentRows];
    console.log(field);

    if (field === 'sourceId') {
      const selectedSource = combinedSources.find((s) => s.id === value);
      updatedRows[index].sourceId = value;
      updatedRows[index].paymentMethod = selectedSource ? selectedSource.type : '';
    }else if (field === 'amount') {
        let alreadyEntered = splitPaymentRows.reduce((sum, row ,ind) => ind !== index ? sum + (parseFloat(row.amount) || 0) : sum + 0 , 0);
        if (alreadyEntered + parseFloat(value || 0) <= totalAmount) {
          updatedRows[index].amount = value; 
      }

    } else {
      updatedRows[index][field] = value;
    }

    setSplitPaymentRows(updatedRows);
  };

  const totalEntered = splitPaymentRows.reduce(
    (sum, row) => sum + (parseFloat(row.amount) || 0),
    0
  );

  const difference = totalAmount - totalEntered;

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600">
        <div className="col-span-5">Customer</div>
        <div className="col-span-3">Source</div>
        <div className="col-span-3">Amount</div>
        <div className="col-span-1"></div>
      </div>

      {/* Payment Rows */}
      <div className="space-y-2">
        {splitPaymentRows.map((row, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            {/* Customer Dropdown */}
            <div className="col-span-5">
              <select
                value={row.customer}
                onChange={(e) =>
                  updateSplitPaymentRow(index, 'customer', e.target.value)
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.partyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Dropdown */}
            <div className="col-span-3">
              <select
                value={row.sourceId}
                onChange={(e) =>
                  updateSplitPaymentRow(index, 'sourceId', e.target.value)
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              >
                <option value="">Select Source</option>
                {combinedSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name} ({source.type === 'cash' ? 'Cash' : 'Bank'})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div className="col-span-3">
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  value={row.amount}
                  onChange={(e) =>
                    updateSplitPaymentRow(index, 'amount', e.target.value)
                  }
                  className="w-full pl-5 pr-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Delete Button */}
            <div className="col-span-1 flex justify-center">
              {splitPaymentRows.length > 1 && (
                <button
                  onClick={() => removeSplitPaymentRow(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Row Button */}
      <button
        onClick={addSplitPaymentRow}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Payment Row
      </button>

      {/* Payment Summary */}
      <div className="bg-gray-50 p-2 rounded-lg border">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Total Entered:</span>
          <span>₹{totalEntered.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs font-medium">
          <span>Order Total:</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
        {difference !== 0 && (
          <div className={`flex justify-between text-xs mt-1 ${
            difference > 0 ? 'text-amber-600' : 'text-red-600'
          }`}>
            <span>{difference > 0 ? 'Remaining:' : 'Excess:'}</span>
            <span>₹{Math.abs(difference).toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPayment;