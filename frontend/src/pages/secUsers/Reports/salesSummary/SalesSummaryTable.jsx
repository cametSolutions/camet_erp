import { PlayCircle } from 'lucide-react';

const SalesSummaryTable = () => {
  const invoices = [
    {
      company: 'RBY',
      invoiceNumber: '6',
      date: '21 Oct 2024',
      dueIn: '7 day(s) to due',
      amount: 440,
      status: 'unpaid',
      unpaidAmount: 430
    },
    {
      company: 'RBY',
      invoiceNumber: '7',
      date: '21 Oct 2024',
      amount: 440,
      status: 'paid'
    },
    {
      company: 'Riyas',
      invoiceNumber: '8',
      date: '21 Oct 2024',
      dueIn: '7 day(s) to due',
      amount: 660,
      status: 'unpaid'
    },
    {
      company: 'Cash Sale',
      invoiceNumber: '9',
      date: '21 Oct 2024',
      amount: 250,
      status: 'paid'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Sales Summary</h2>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            This week 21 Oct 2024 - 27 Oct 2024
          </div>
          <button className="text-indigo-600">CHANGE</button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="text-gray-600 mb-2">Total Sales Amount</div>
            <div className="text-2xl font-semibold">₹ 1,790</div>
          </div>
          <button className="text-indigo-600 flex items-center">
            View Full Report
            <span className="ml-1 text-xs bg-gray-100 px-1 rounded">PDF</span>
          </button>
        </div>

        <div className="space-y-4">
          {invoices.map((invoice, index) => (
            <div key={index} className="border-b pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-gray-800">{invoice.company}</div>
                  <div className="text-gray-500">Invoice #{invoice.invoiceNumber}</div>
                  <div className="text-gray-500 text-sm">{invoice.date}</div>
                  {invoice.dueIn && (
                    <div className="text-gray-500 text-sm">{invoice.dueIn}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">₹ {invoice.amount}</div>
                  {invoice.status === 'paid' ? (
                    <div className="text-green-500 text-sm">Paid</div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <div className="bg-red-100 text-red-500 px-2 py-1 rounded text-sm">
                        {invoice.unpaidAmount ? `Unpaid ₹ ${invoice.unpaidAmount}` : 'Unpaid'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {invoice.company === 'RBY' && invoice.invoiceNumber === '7' && (
                <div className="flex justify-center mt-2">
                  <PlayCircle className="text-gray-500 w-8 h-8" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesSummaryTable;