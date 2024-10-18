"use client";

import { useState } from 'react';
import SearchBusinessForm from './search-business-form';
import { trpc } from '@/utils/trpc';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmittedOffers() {
    const { data: businesses, isLoading, isError } = trpc.getBusinesses.useQuery({ limit: 20, page: 1 });
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);

    // Toggle filter section
    const toggleModal = () => setModalOpen(!isModalOpen);
    const toggleFilter = () => setShowFilter(!showFilter);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-purple-500 rounded-full" role="status"></div>
                <span className="ml-2 text-purple-700">Loading...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500">Failed to load businesses. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                {/* Title */}
                <h1 className="text-xl md:text-3xl font-extrabold text-gray-800">
                    Business Searches
                </h1>

                {/* Button */}
                <button
                    onClick={toggleModal}
                    className="flex items-center text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 active:scale-95 transition-transform duration-150 ease-in-out px-6 py-2 md:px-8 md:py-3 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 17l-5-5m0 0l5-5m-5 5h12"
                        />
                    </svg>
                    Search Business Form
                </button>
            </div>

            {/* Filters Section for Mobile */}
            <div className="block md:hidden mb-4">
                <button
                    onClick={toggleFilter}
                    className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg shadow hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    Filter Offers
                </button>
                {showFilter && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 p-4 bg-white rounded-lg shadow-md"
                    >
                        <label className="block mb-2">
                            <span className="text-sm font-medium text-gray-700">Status</span>
                            <select className="w-full bg-gray-100 text-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400">
                                <option>All</option>
                                <option>Accepted</option>
                                <option>Rejected</option>
                                <option>Awaiting Response</option>
                            </select>
                        </label>
                        <button className="w-full mt-2 bg-purple-600 text-white py-2 rounded-lg shadow hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400">
                            Apply Filters
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Mobile-First Card Layout for Offers (Visible on Small Screens) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {businesses?.map((business) => (
                    <motion.div
                        key={business.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                        {/* Header Section: Title and Email Status */}
                        <div className="flex justify-between items-center mb-4">
                            {/* Business Title */}
                            <span
                                className="font-bold text-lg md:text-xl text-gray-900 truncate hover:text-indigo-600 transition-colors duration-300"
                                title={business.title} // Tooltip to show full title
                            >
                                {business.title}
                            </span>


                            {/* Email Status with Improved Padding and Colors */}
                            <span
                                className={`flex-shrink-0 py-1 px-4 rounded-full text-sm font-semibold tracking-wide shadow-md transition-all duration-300 ${business.hasEmails
                                    ? 'bg-green-200 text-green-800 hover:bg-green-300'
                                    : 'bg-red-200 text-red-800 hover:bg-red-300'
                                    }`}
                            >
                                {business.hasEmails ? 'Has Emails' : 'No Emails'}
                            </span>
                        </div>

                        {/* Details Section: Price, Website, Phone, Location */}
                        <div className="text-gray-700 space-y-2">
                            <div className="text-sm md:text-base">
                                <span className="font-semibold text-gray-800">Price:</span>
                                <span className="text-gray-700 ml-2">{business.price}</span>
                            </div>

                            <div className="text-sm">
                                <span className="font-semibold">Website:</span>
                                <div className="max-w-xs md:max-w-sm lg:max-w-md inline-block">
                                    <a
                                        href={business.website}
                                        className="text-indigo-600 hover:underline truncate block"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={business.website}  // Tooltip to show full URL on hover
                                    >
                                        {business.website}
                                    </a>
                                </div>
                            </div>

                            <div className="text-sm">
                                <span className="font-semibold">Phone:</span>
                                <a
                                    href={`tel:${business.phoneUnformatted}`}
                                    className="text-indigo-600 hover:underline ml-1 block md:inline-block truncate"
                                    title={`Call ${business.phoneUnformatted}`} // Tooltip for accessibility
                                >
                                    {business.phoneUnformatted}
                                </a>
                            </div>


                            <div className="text-sm">
                                <span className="font-semibold">Location:</span>
                                <a
                                    href={`https://www.google.com/maps?q=${business.location.lat},${business.location.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:underline ml-1 block md:inline-block truncate"
                                    title={`View location on Google Maps`}  // Tooltip to provide extra context
                                >
                                    Lat {business.location.lat.toFixed(6)}, Lng {business.location.lng.toFixed(6)}
                                </a>
                            </div>
                        </div>

                        {/* Email Section */}
                        {business.emails.length > 0 && (
                            <div className="mt-4">
                                <span className="text-sm font-semibold text-gray-800">Emails:</span>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    {business.emails.map((email) => (
                                        <li
                                            key={email.address}
                                            className="text-sm text-gray-600 truncate hover:text-indigo-600 transition-colors duration-300"
                                            title={email.address} // Tooltip to show full email address
                                        >
                                            <a href={`mailto:${email.address}`} className="hover:underline">
                                                {email.address}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}


                        <button className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                            View Details
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Table Layout (Visible on Larger Screens) */}
            <div className="hidden md:block overflow-x-auto bg-white shadow-xl rounded-lg mt-6">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr className="text-gray-600 text-xs uppercase font-bold tracking-wider">
                            <th className="py-4 px-4">Title</th>
                            <th className="py-4 px-4">Price</th>
                            <th className="py-4 px-4">Website</th>
                            <th className="py-4 px-4">Phone</th>
                            <th className="py-4 px-4">Location</th>
                            <th className="py-4 px-4">State</th>
                            <th className="py-4 px-4">Emails</th>
                            <th className="py-4 px-4">Has Emails?</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {businesses?.map((business) => (
                            <tr key={business.id} className="border-b hover:bg-gray-50 transition duration-300">
                                <td className="py-4 px-4 font-semibold text-gray-800">{business.title}</td>
                                <td className="py-4 px-4">{business.price}</td>
                                <td className="py-4 px-4">
                                    <a href={business.website} target="_blank" className="text-indigo-600 hover:underline">
                                        {business.website}
                                    </a>
                                </td>
                                <td className="py-4 px-4">{business.phoneUnformatted}</td>
                                <td className="py-4 px-4">
                                    Lat: {business.location.lat}, Lng: {business.location.lng}
                                </td>
                                <td className="py-4 px-4">{business.state || 'N/A'}</td>
                                <td className="py-4 px-4">
                                    {business.emails.length > 0 ? (
                                        <ul className="list-disc pl-4">
                                            {business.emails.map((email) => (
                                                <li key={email.address}>{email.address}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'No Emails'
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    <span
                                        className={`py-1 px-3 rounded-full text-xs ${business.hasEmails
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-600'
                                            }`}
                                    >
                                        {business.hasEmails ? 'Yes' : 'No'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            <div className="flex items-center justify-between mt-6">
                <div className="text-gray-600 text-sm">Showing 1 to 5 of 20 entries</div>
                <div className="flex space-x-2">
                    <button className="bg-gray-200 text-gray-600 py-2 px-3 rounded transition hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
                        First
                    </button>
                    <button className="bg-indigo-600 text-white py-2 px-3 rounded transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                        1
                    </button>
                    <button className="bg-gray-200 text-gray-600 py-2 px-3 rounded transition hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
                        2
                    </button>
                    <button className="bg-gray-200 text-gray-600 py-2 px-3 rounded transition hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
                        Last
                    </button>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <SearchBusinessForm toggleModal={toggleModal} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
