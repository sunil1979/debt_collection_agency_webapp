'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function InteractionFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filterDate, setFilterDate] = useState(searchParams.get('date') || '');
  const [filterCustomerName, setFilterCustomerName] = useState(searchParams.get('customerName') || '');
  const [filterCustomerEmail, setFilterCustomerEmail] = useState(searchParams.get('customerEmail') || '');
  const [filterCustomerPhone, setFilterCustomerPhone] = useState(searchParams.get('customerPhone') || '');

  useEffect(() => {
    setFilterDate(searchParams.get('date') || '');
    setFilterCustomerName(searchParams.get('customerName') || '');
    setFilterCustomerEmail(searchParams.get('customerEmail') || '');
    setFilterCustomerPhone(searchParams.get('customerPhone') || '');
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filterDate) {
      params.set('date', filterDate);
    }
    if (filterCustomerName) {
      params.set('customerName', filterCustomerName);
    }
    if (filterCustomerEmail) {
      params.set('customerEmail', filterCustomerEmail);
    }
    if (filterCustomerPhone) {
      params.set('customerPhone', filterCustomerPhone);
    }
    router.push(`/interactions?${params.toString()}`);
    setIsOpen(false);
  };

  const resetFilters = () => {
    setFilterDate('');
    setFilterCustomerName('');
    setFilterCustomerEmail('');
    setFilterCustomerPhone('');
    router.push('/interactions');
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
          <div className="mb-4">
            <label htmlFor="filterCustomerEmail" className="block text-sm font-medium text-gray-700">Customer Email:</label>
            <input
              type="email"
              id="filterCustomerEmail"
              name="filterCustomerEmail"
              value={filterCustomerEmail}
              onChange={(e) => setFilterCustomerEmail(e.target.value)}
              placeholder="Enter customer email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="filterCustomerPhone" className="block text-sm font-medium text-gray-700">Customer Phone:</label>
            <input
              type="tel"
              id="filterCustomerPhone"
              name="filterCustomerPhone"
              value={filterCustomerPhone}
              onChange={(e) => setFilterCustomerPhone(e.target.value)}
              placeholder="Enter customer phone"
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