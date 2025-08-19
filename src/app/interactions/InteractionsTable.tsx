'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FlatInteraction } from './page';

interface InteractionsTableProps {
  interactions: FlatInteraction[];
  page: number;
  limit: number;
  totalInteractions: number;
}

const ExpandedRow = ({ interaction }: { interaction: FlatInteraction }) => (
  <tr className="bg-gray-100">
    <td colSpan={11} className="p-4">
      <div className="flex flex-col space-y-2">
        {interaction.interaction?.items && interaction.interaction.items.length > 0 ? (
          interaction.interaction.items.map((item, itemIndex) => (
            <div key={itemIndex} className={`flex ${item.role === 'agent' ? 'justify-start' : 'justify-end'}`}>
              <div className={`rounded-lg px-4 py-2 ${item.role === 'agent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                <p className="font-bold">{item.role}</p>
                {item.content.map((line, lineIndex) => (
                  <p key={lineIndex}>{line}</p>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No interaction items found.</p>
        )}
      </div>
    </td>
  </tr>
);

export default function InteractionsTable({ interactions, page, limit, totalInteractions }: InteractionsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalInteractions / limit);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (error) {
      console.error('Error formatting time:', error);
      return dateTimeString;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getPaginationLink = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    return `/interactions?${params.toString()}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="w-12"></th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Customer Name</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Interaction Date</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Start Time</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">End Time</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Audio</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Sentiment</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Agent Notes</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Followup Required</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Followup Date</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Cost</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {interactions.map((interaction) => (
            <React.Fragment key={interaction._id}>
              <tr
                className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleRow(interaction._id)}
              >
                <td className="py-3 px-4 text-center">
                  {expandedRow === interaction._id ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  )}
                </td>
                <td className="py-3 px-4">{interaction.customer_name}</td>
                <td className="py-3 px-4">{formatDate(interaction.interaction_date)}</td>
                <td className="py-3 px-4">{formatTime(interaction.start_time)}</td>
                <td className="py-3 px-4">{formatTime(interaction.end_time)}</td>
                <td className="py-3 px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </td>
                <td className="py-3 px-4">{interaction.interaction_sentiment_analysis}</td>
                <td className="py-3 px-4">{interaction.agent_notes}</td>
                <td className="py-3 px-4">{interaction.followup_required ? 'Yes' : 'No'}</td>
                <td className="py-3 px-4">{formatDate(interaction.followup_date)}</td>
                <td className="py-3 px-4">${interaction.cost.toFixed(2)}</td>
              </tr>
              {expandedRow === interaction._id && <ExpandedRow interaction={interaction} />}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <Link
            href={getPaginationLink(page - 1)}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
              page === 1 ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Previous
          </Link>
          <Link
            href={getPaginationLink(page + 1)}
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
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalInteractions)}</span> of{' '}
              <span className="font-medium">{totalInteractions}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Link
                href={getPaginationLink(page - 1)}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  page === 1 ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
              {[...Array(totalPages)].map((_, i) => (
                <Link
                  key={i}
                  href={getPaginationLink(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                    i + 1 === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : ''
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
              <Link
                href={getPaginationLink(page + 1)}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  page === totalPages ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <span className="sr-only">Next</span>
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