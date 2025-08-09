'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function InteractionFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date().toISOString().split('T')[0];

  const [isOpen, setIsOpen] = useState(false);
  const [filterDate, setFilterDate] = useState(searchParams.get('date') || today);
  const [filterCustomerName, setFilterCustomerName] = useState(searchParams.get('customerName') || '');

  useEffect(() => {
    // Sync internal state with URL params on initial load or URL changes
    setFilterDate(searchParams.get('date') || today);
    setFilterCustomerName(searchParams.get('customerName') || '');
  }, [searchParams, today]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filterDate) {
      params.set('date', filterDate);
    }
    if (filterCustomerName) {
      params.set('customerName', filterCustomerName);
    }
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const resetFilters = () => {
    setFilterDate(today);
    setFilterCustomerName('');
    router.push(`?`); // Clear all search params
    setIsOpen(false);
  };

  return (
    <div className="relative flex justify-end mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Filter Interactions
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-12 w-80 bg-white rounded-md shadow-lg z-10 p-4">
          <h3 className="text-lg font-semibold mb-4">Filter Interactions</h3>
          <div className="mb-4">
            <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700">Interaction Date:</label>
            <input
              type="date"
              id="filterDate"
              name="filterDate"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="filterCustomerName" className="block text-sm font-medium text-gray-700">Customer Name:</label>
            <input
              type="text"
              id="filterCustomerName"
              name="filterCustomerName"
              value={filterCustomerName}
              onChange={(e) => setFilterCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
