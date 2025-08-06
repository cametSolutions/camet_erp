import React from "react";

export default function OutStandingModal({ showModal, onClose, outStanding }) {
    console.log(outStanding);
  if (!showModal) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getSourceBadgeColor = (source) => {
    switch (source) {
      case 'Booking':
        return 'bg-blue-100 text-blue-800';
      case 'CheckOut':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const items = outStanding || [];
  const totalAmount = items.reduce((sum, item) => sum + (item.bill_amount || 0), 0);
  const totalPending = items.reduce((sum, item) => sum + (item.bill_pending_amt || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Outstanding Bills</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto p-6">
          {items.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bill No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Party Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mobile</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bill Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Pending</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Source</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.bill_no}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{item.party_name}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{item.mobile_no}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{formatDate(item.bill_date)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.bill_amount)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`text-sm font-medium ${
                        item.bill_pending_amt > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(item.bill_pending_amt)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSourceBadgeColor(item.source)}`}>
                        {item.source}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          item.isCancelled ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-xs text-gray-600">
                          {item.isCancelled ? 'Cancelled' : 'Active'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">No outstanding bills to display</div>
            </div>
          )}
        </div>

        {/* Footer with Summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total:</span> {items.length} bills • 
                Amount: <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span> • 
                Pending: <span className={`font-semibold ${totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(totalPending)}
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}