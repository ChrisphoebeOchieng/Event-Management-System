import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface EventSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

export interface SearchFilters {
  search: string;
  category: string;
  city: string;
  dateFrom: string;
  dateTo: string;
  priceMin: string;
  priceMax: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const categories = ['All', 'Technology', 'Music', 'Business', 'Art', 'Sports', 'Food', 'Education', 'Fashion', 'Health', 'Other'];
const cities = ['All', 'Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru'];
const sortOptions = [
  { value: 'start_date', label: 'Date' },
  { value: 'title', label: 'Title' },
  { value: 'ticket_price', label: 'Price' },
  { value: 'created_at', label: 'Created Date' },
];

const EventSearch: React.FC<EventSearchProps> = ({ onSearch, onReset }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category: 'All',
    city: 'All',
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: '',
    status: 'All',
    sortBy: 'start_date',
    sortOrder: 'asc',
  });

  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    updateActiveFilterCount(newFilters);
  };

  const updateActiveFilterCount = (currentFilters: SearchFilters) => {
    let count = 0;
    if (currentFilters.search) count++;
    if (currentFilters.category !== 'All') count++;
    if (currentFilters.city !== 'All') count++;
    if (currentFilters.dateFrom) count++;
    if (currentFilters.dateTo) count++;
    if (currentFilters.priceMin) count++;
    if (currentFilters.priceMax) count++;
    if (currentFilters.status !== 'All') count++;
    setActiveFilterCount(count);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: 'All',
      city: 'All',
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: '',
      status: 'All',
      sortBy: 'start_date',
      sortOrder: 'asc' as const,
    };
    setFilters(resetFilters);
    setActiveFilterCount(0);
    onReset();
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-4">
      <form onSubmit={handleSubmit}>
        {/* Main Search Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search events by title, description, or venue..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                showFilters ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            
            <button
              type="submit"
              className="btn-primary"
            >
              Search
            </button>
            
            {(filters.search || activeFilterCount > 0) && (
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary flex items-center gap-1"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="input-label">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">City</label>
                <select
                  name="city"
                  value={filters.city}
                  onChange={handleChange}
                  className="input-field"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="All">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="input-label">Sort By</label>
                <div className="flex gap-2">
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleChange}
                    className="flex-1 input-field"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    name="sortOrder"
                    value={filters.sortOrder}
                    onChange={handleChange}
                    className="w-24 input-field"
                  >
                    <option value="asc">↑ Asc</option>
                    <option value="desc">↓ Desc</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="input-label">Date From</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Date To</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Min Price (KES)</label>
                <input
                  type="number"
                  name="priceMin"
                  value={filters.priceMin}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Max Price (KES)</label>
                <input
                  type="number"
                  name="priceMax"
                  value={filters.priceMax}
                  onChange={handleChange}
                  placeholder="1000"
                  min="0"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EventSearch;
