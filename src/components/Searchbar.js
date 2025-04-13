import { useState, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import VoiceSearch from './VoiceSearch';

const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };
  
  const handleVoiceSearchResult = (transcript) => {
    setSearchTerm(transcript);
    // Focus the input after voice input
    inputRef.current?.focus();
    // Submit the search after a short delay to give user time to see what was transcribed
    setTimeout(() => {
      if (transcript.trim()) {
        onSearch(transcript);
      }
    }, 500);
  };
  
  return (
    <div className="flex items-center">
      <form onSubmit={handleSubmit} className="relative flex-1 mr-2">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full py-2 pl-10 pr-4 text-sm bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-blue-300"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="text-gray-400" />
          </div>
        </div>
      </form>
      
      <VoiceSearch onSearchResult={handleVoiceSearchResult} />
    </div>
  );
};

export default SearchBar; 