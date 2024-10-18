import { trpc } from '@/utils/trpc';
import React, { useState } from 'react';
import { State } from 'country-state-city';
import { CustomTypeHead, Option } from './CustomTypeHead';
import queryClient from '@/utils/query-client';
import { FaSpinner } from 'react-icons/fa'; // Import a spinner icon

const stateOptions = State.getStatesOfCountry('GB')?.map((state: { isoCode: string; name: string; }) => ({
    value: state.isoCode,
    label: state.name
}));

interface SearchBusinessFormProps {
    toggleModal: () => void;
}

const defaultFormData = {
    searchStringsArray: [''],
    maxCrawledPlacesPerSearch: 5,
    language: 'en',
    deeperCityScrape: false,
    searchMatching: 'all',
    placeMinimumStars: '',
    skipClosedPlaces: true,
    website: 'allPlaces'
}

const SearchBusinessForm: React.FC<SearchBusinessFormProps> = ({ toggleModal }) => {
    const [selectedCity, setSelectedCity] = useState<Option | null>(null);
    const [formData, setFormData] = useState(defaultFormData);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ searchStringsArray?: string, selectedCity?: string, maxCrawledPlacesPerSearch?: string }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: (e.target as HTMLInputElement).checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const updatedArray = [...formData.searchStringsArray];
        updatedArray[index] = e.target.value;
        setFormData({ ...formData, searchStringsArray: updatedArray });
    };

    const addSearchString = () => {
        setFormData({
            ...formData,
            searchStringsArray: [...formData.searchStringsArray, '']
        });
    };

    const { mutate, isLoading } = trpc.searchBusiness.useMutation({
        onSettled: () => {
            setLoading(false);
            setFormData(defaultFormData);
        },
        onSuccess: async () => {
            // Invalidate queries to refetch after mutation success
            await queryClient.invalidateQueries({
                queryKey: [
                    ['getBusinesses'],
                    { input: { limit: 10, page: 1 }, type: 'query' },
                ],
            });
        },
    });

    const validateForm = () => {
        const errors: { searchStringsArray?: string, selectedCity?: string, maxCrawledPlacesPerSearch?: string } = {};

        if (formData.searchStringsArray.some((str) => str.trim() === '')) {
            errors.searchStringsArray = "Search strings cannot be empty.";
        }

        if (!selectedCity) {
            errors.selectedCity = "Please select a city.";
        }

        if (formData.maxCrawledPlacesPerSearch <= 0 || isNaN(formData.maxCrawledPlacesPerSearch)) {
            errors.maxCrawledPlacesPerSearch = "Please enter a valid number greater than 0.";
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        mutate({ ...formData, locationQuery: selectedCity!.label });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 md:mx-0 p-6 transform transition-all md:max-w-md lg:max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Search Business</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700 transition duration-150"
                        onClick={toggleModal}
                    >
                        <svg
                            className="w-6 h-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Search Strings Array */}
                    {formData.searchStringsArray.map((searchString, index) => (
                        <div key={index} className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Search String #{index + 1}</label>
                            <input
                                type="text"
                                name={`searchString-${index}`}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                value={searchString}
                                onChange={(e) => handleArrayChange(e, index)}
                            />
                            {errors.searchStringsArray && <p className="text-red-500 text-xs mt-1">{errors.searchStringsArray}</p>}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addSearchString}
                        className="text-indigo-600 hover:underline text-sm font-medium mb-4"
                    >
                        Add Another Search String
                    </button>

                    {/* Location Query */}
                    <div className="mb-4">
                        <CustomTypeHead
                            options={stateOptions}
                            value={selectedCity as unknown as string}
                            onChange={setSelectedCity}
                            placeholder="Select a city"
                            icon={null} />
                        {errors.selectedCity && <p className="text-red-500 text-xs mt-1">{errors.selectedCity}</p>}
                    </div>

                    {/* Max Crawled Places Per Search */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Max Crawled Places</label>
                        <input
                            type="number"
                            name="maxCrawledPlacesPerSearch"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            value={formData.maxCrawledPlacesPerSearch}
                            onChange={handleInputChange}
                        />
                        {errors.maxCrawledPlacesPerSearch && <p className="text-red-500 text-xs mt-1">{errors.maxCrawledPlacesPerSearch}</p>}
                    </div>

                    {/* Deeper City Scrape */}
                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            name="deeperCityScrape"
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            checked={formData.deeperCityScrape}
                            onChange={handleInputChange}
                        />
                        <label className="ml-2 block text-sm font-medium text-gray-700">Deeper City Scrape</label>
                    </div>

                    {/* Place Minimum Stars */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Place Minimum Stars</label>
                        <input
                            type="text"
                            name="placeMinimumStars"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            value={formData.placeMinimumStars}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            className="text-red-600 hover:text-red-700 transition-all"
                            onClick={toggleModal}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`bg-black text-white px-4 py-2 rounded-full shadow hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading || isLoading}
                        >
                            {(loading || isLoading) ? <FaSpinner className="animate-spin inline-block" /> : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SearchBusinessForm;
