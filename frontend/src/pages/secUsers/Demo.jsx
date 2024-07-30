import  { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const Demo = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Function to fetch search results (example)
  const fetchSearchResults = async (searchQuery) => {
    // Replace with your actual search API call
    const response = await fetch(`/api/search?q=${searchQuery}`);
    const data = await response.json();
    setResults(data.results);
  };

  // Debounced function to call the search API
  const debouncedFetchResults = useCallback(
    debounce((searchQuery) => {
      fetchSearchResults(searchQuery);
    }, 300),
    []
  );

  // Handle input change
  const handleChange = (e) => {
    const { value } = e.target;
    setQuery(value);
    debouncedFetchResults(value);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
      />
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Demo;
