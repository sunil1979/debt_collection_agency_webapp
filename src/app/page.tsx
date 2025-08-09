import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Outstanding Debt</h2>
          <p className="text-3xl font-bold text-red-600">$1,234,567.89</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Customers</h2>
          <p className="text-3xl font-bold text-blue-600">5,432</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Recent Interactions</h2>
          <p className="text-3xl font-bold text-green-600">123</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link href="/customers" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            View All Customers
          </Link>
          <Link href="/interactions" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
            Log New Interaction
          </Link>
        </div>
      </div>
    </div>
  );
}
