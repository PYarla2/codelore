import React from 'react';

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter
}) => {
  const roleOptions = [
    'All',
    'UI Component',
    'API Endpoint',
    'Authentication',
    'Database',
    'Utility',
    'Configuration',
    'Service',
    'Type Definition',
    'Test',
    'Documentation'
  ];

  return (
    <div className="p-4 border-b border-gray-200 space-y-4">
      {/* Search Bar */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Files
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by filename or path..."
          />
        </div>
      </div>

      {/* Role Filter */}
      <div>
        <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Role
        </label>
        <select
          id="role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Stats */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Search: "{searchQuery}"</span>
          <span>Role: {roleFilter}</span>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters; 