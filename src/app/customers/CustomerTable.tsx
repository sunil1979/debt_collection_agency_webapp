'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Customer {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  mob_number: string;
  debt_details: {
    total_outstanding: number;
  };
  id: string;
  lastContactedOn?: string;
}

interface CustomerTableProps {
  customers: Customer[];
  totalCustomers: number;
  page: number;
  limit: number;
}

interface AppSettings {
  agentName?: string;
}

export default function CustomerTable({ customers, totalCustomers, page, limit }: CustomerTableProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>({});

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    }
    fetchSettings();
  }, []);

  const totalPages = Math.ceil(totalCustomers / limit);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allCustomerIds = customers.map((customer) => customer.id);
      setSelectedCustomers(allCustomerIds);
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (event: React.ChangeEvent<HTMLInputElement>, customerId: string) => {
    if (event.target.checked) {
      setSelectedCustomers((prevSelected) => [...prevSelected, customerId]);
    } else {
      setSelectedCustomers((prevSelected) =>
        prevSelected.filter((id) => id !== customerId)
      );
    }
  };

  const handleCall = async (customerId: string) => {
    try {
      const response = await fetch('/api/proxy/dispatch-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          agent_name: settings.agentName,
        }),
      });

      if (response.ok) {
        console.log('Call initiated successfully');
      } else {
        console.error('Failed to initiate call');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleString('en-GB', options);
  };

  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedCustomers.length === customers.length && customers.length > 0}
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Outstanding Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Contacted On
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr key={customer._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={(event) => handleSelectCustomer(event, customer.id)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{customer.first_name} {customer.last_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{customer.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{customer.mob_number}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">${customer.debt_details.total_outstanding}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(customer.lastContactedOn)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-4">
                  <a onClick={() => handleCall(customer.id)} className="text-blue-600 hover:text-blue-900 flex items-center cursor-pointer">
                    📞 Call
                  </a>
                  <Link href={`/interactions?customerName=${encodeURIComponent(customer.first_name + ' ' + customer.last_name)}&customerEmail=${encodeURIComponent(customer.email)}`} className="text-green-600 hover:text-green-900 flex items-center">
                    📜 History
                  </Link>
                  <a href={`/customers/${customer.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                    👁️ View
                  </a>
                  <a href={`/customers/${customer.id}/edit`} className="text-yellow-600 hover:text-yellow-900 flex items-center">
                    ✏️ Edit
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <Link
            href={{ pathname: '/customers', query: { page: page - 1, limit } }}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
              page === 1 ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Previous
          </Link>
          <Link
            href={{ pathname: '/customers', query: { page: page + 1, limit } }}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
              page === totalPages ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Next
          </Link>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalCustomers)}</span> of{' '}
              <span className="font-medium">{totalCustomers}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Link
                href={{ pathname: '/customers', query: { page: page - 1, limit } }}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  page === 1 ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <span className="sr-only">Previous</span>
                {/* Heroicon name: solid/chevron-left */}
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
              {[...Array(totalPages)].map((_, i) => (
                <Link
                  key={i}
                  href={{ pathname: '/customers', query: { page: i + 1, limit } }}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                    i + 1 === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : ''
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
              <Link
                href={{ pathname: '/customers', query: { page: page + 1, limit } }}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  page === totalPages ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <span className="sr-only">Next</span>
                {/* Heroicon name: solid/chevron-right */}
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </nav>
          </div>
        </div>
      </nav>
    </div>
  );
}
