'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Interaction {
  interaction_date: string;
  start_time: string;
  end_time: string;
  agent_id: string;
  agent_name: string;
  job_id: string;
  audio_file: string;
  interaction_sentiment_analysis: string;
  agent_notes: string;
  followup_required: boolean;
  followup_date: string;
  interaction: {
    items: {
      id: string;
      type: string;
      role: 'agent' | 'customer';
      content: string[];
      interrupted: boolean;
      transcript_confidence: number;
    }[];
  };
}

interface CustomerInteraction {
  _id: string;
  customer_id: string;
  customer_name?: string;
  interactions: Interaction[];
}

interface InteractionsTableProps {
  interactions: CustomerInteraction[];
  page: number;
  limit: number;
  totalInteractions: number;
}

export default function InteractionsTable({ interactions, page, limit, totalInteractions }: InteractionsTableProps) {
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [expandedInteraction, setExpandedInteraction] = useState<string | null>(null);
  const [innerPage, setInnerPage] = useState<{[key: string]: number}>({}); // State for inner pagination

  const [innerSortColumn, setInnerSortColumn] = useState<string | null>(null);
  const [innerSortOrder, setInnerSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleInnerSort = (column: string) => {
    if (innerSortColumn === column) {
      setInnerSortOrder(innerSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setInnerSortColumn(column);
      setInnerSortOrder('asc');
    }
  };

  const handleInnerPageChange = (customerId: string, newPage: number) => {
    setInnerPage(prev => ({
      ...prev,
      [customerId]: newPage
    }));
  };

  const innerLimit = 5; // Number of interactions per inner page

  const totalPages = Math.ceil(totalInteractions / limit);

  const toggleCustomer = (id: string) => {
    setExpandedCustomer(expandedCustomer === id ? null : id);
    setExpandedInteraction(null); // Collapse interaction when customer is collapsed
    setInnerPage({}); // Reset inner pagination when customer is collapsed
  };

  const toggleInteraction = (id: string) => {
    setExpandedInteraction(expandedInteraction === id ? null : id);
  };

  const formatHeader = (header: string) => {
    if (header === 'interaction_sentiment_analysis') return 'Sentiment';
    return header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (error) {
      console.error('Error formatting time:', error);
      return dateTimeString; // Return original string if formatting fails
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original string if formatting fails
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm w-12"></th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Customer Name</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {interactions.map((customerInteraction) => (
            <React.Fragment key={customerInteraction._id}>
              <tr
                key={customerInteraction._id}
                className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleCustomer(customerInteraction._id)}
              >
                <td className="py-3 px-4 text-center">
                  {expandedCustomer === customerInteraction._id ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  )}
                </td>
                <td className="py-3 px-4">{customerInteraction.customer_name}</td>
              </tr>
              {expandedCustomer === customerInteraction._id && (
                <tr>
                  <td colSpan={2} className="p-4 bg-gray-50">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-200 text-gray-600">
                        <tr>
                          <th className="w-12"></th>
                          <th className="text-left py-2 px-3">{formatHeader('interaction_date')}</th>
                          <th className="text-left py-2 px-3 cursor-pointer" onClick={() => handleInnerSort('start_time')}>
                            {formatHeader('start_time')}
                            {innerSortColumn === 'start_time' && (
                              innerSortOrder === 'asc' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              )
                            )}
                          </th>
                          <th className="text-left py-2 px-3 cursor-pointer" onClick={() => handleInnerSort('end_time')}>
                            {formatHeader('end_time')}
                            {innerSortColumn === 'end_time' && (
                              innerSortOrder === 'asc' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              )
                            )}
                          </th>
                          {[ 'agent_name', 'audio_file', 'interaction_sentiment_analysis', 'agent_notes', 'followup_required', 'followup_date'].map(header => (
                            <th key={header} className="text-left py-2 px-3">{formatHeader(header)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {customerInteraction.interactions.sort((a, b) => {
                          if (!innerSortColumn) return 0;

                          const getTimeValue = (interaction: any, column: string) => {
                            const datePart = interaction.interaction_date;
                            const timePart = interaction[column];
                            return new Date(`${datePart}T${timePart}`);
                          };

                          const valueA = getTimeValue(a, innerSortColumn);
                          const valueB = getTimeValue(b, innerSortColumn);

                          if (valueA < valueB) {
                            return innerSortOrder === 'asc' ? -1 : 1;
                          } else if (valueA > valueB) {
                            return innerSortOrder === 'asc' ? 1 : -1;
                          } else {
                            return 0;
                          }
                        }).slice(
                          ((innerPage[customerInteraction._id] || 1) - 1) * innerLimit,
                          (innerPage[customerInteraction._id] || 1) * innerLimit
                        ).map((interaction, index) => (
                          <React.Fragment key={`${customerInteraction._id}-${index}`}>
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer" onClick={() => toggleInteraction(`${customerInteraction._id}-${index}`)}>
                              <td className="py-2 px-3 text-center">
                                {expandedInteraction === `${customerInteraction._id}-${index}` ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                )}
                              </td>
                              <td className="py-2 px-3">{formatDate(interaction.interaction_date)}</td>
                              <td className="py-2 px-3">{formatTime(interaction.start_time)}</td>
                              <td className="py-2 px-3">{formatTime(interaction.end_time)}</td>
                              <td className="py-2 px-3">{interaction.agent_name}</td>
                              <td className="py-2 px-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </td>
                              <td className="py-2 px-3">{interaction.interaction_sentiment_analysis}</td>
                              <td className="py-2 px-3">{interaction.agent_notes}</td>
                              <td className="py-2 px-3">{interaction.followup_required ? 'Yes' : 'No'}</td>
                              <td className="py-2 px-3">{formatDate(interaction.followup_date)}</td>
                            </tr>
                            {expandedInteraction === `${customerInteraction._id}-${index}` && (
                              <tr>
                                <td colSpan={10} className="p-4 bg-gray-100">
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
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                    {/* Inner Pagination Controls */}
                    {customerInteraction.interactions.length > innerLimit && (
                      <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                          <button
                            onClick={() => handleInnerPageChange(customerInteraction._id, (innerPage[customerInteraction._id] || 1) - 1)}
                            disabled={(innerPage[customerInteraction._id] || 1) === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => handleInnerPageChange(customerInteraction._id, (innerPage[customerInteraction._id] || 1) + 1)}
                            disabled={(innerPage[customerInteraction._id] || 1) * innerLimit >= customerInteraction.interactions.length}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Next
                          </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing <span className="font-medium">{(innerPage[customerInteraction._id] || 1) - 1}</span> to <span className="font-medium">{Math.min((innerPage[customerInteraction._id] || 1) * innerLimit, customerInteraction.interactions.length)}</span> of 
                              <span className="font-medium">{customerInteraction.interactions.length}</span> results
                            </p>
                          </div>
                          <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              {[...Array(Math.ceil(customerInteraction.interactions.length / innerLimit))].map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleInnerPageChange(customerInteraction._id, i + 1)}
                                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                                    i + 1 === (innerPage[customerInteraction._id] || 1) ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : ''
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              ))}
                            </nav>
                          </div>
                        </div>
                      </nav>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <Link
            href={{ pathname: '/interactions', query: { page: page - 1, limit } }}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
              page === 1 ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Previous
          </Link>
          <Link
            href={{ pathname: '/interactions', query: { page: page + 1, limit } }}
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
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalInteractions)}</span> of 
              <span className="font-medium">{totalInteractions}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {[...Array(totalPages)].map((_, i) => (
                <Link
                  key={i}
                  href={{ pathname: '/interactions', query: { page: i + 1, limit } }}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                    i + 1 === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : ''
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
              <Link
                href={{ pathname: '/interactions', query: { page: page + 1, limit } }}
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
