'use client';

interface PaymentSchedule {
  payment_date: string;
  amount: number;
  payment_status: string;
}

interface PaymentPlan {
  payment_reference_number: string;
  payment_schedule: PaymentSchedule[];
}

interface PaymentPlanModalProps {
  paymentPlan: PaymentPlan;
  onClose: () => void;
}

export default function PaymentPlanModal({ paymentPlan, onClose }: PaymentPlanModalProps) {
  if (!paymentPlan) {
    return null;
  }

  // Sort the payment schedule by date in ascending order
  const sortedSchedule = [...paymentPlan.payment_schedule].sort(
    (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Plan Details</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              <strong>Payment Reference Number:</strong> {paymentPlan.payment_reference_number}
            </p>
            <div className="mt-4">
              <h4 className="text-md font-semibold text-gray-800 mb-2">Payment Schedule</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedSchedule.map((schedule, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(schedule.payment_date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${schedule.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          schedule.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                          schedule.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {schedule.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              id="ok-btn"
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
