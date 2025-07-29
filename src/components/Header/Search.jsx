import axios from "axios";
import React, { useState, useRef, useEffect,useMemo } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';

const Search = ({ isExpanded, onToggle, isCollapsed, isMobile }) => {

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hasSearched, setHasSearched] = useState(false) ; 

  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // search - integrate with backend 

  const fetchSearchResults = async (query) => {

    console.log("API hit with query: ", query);

    setLoading(true);
    setError(null);
    setHasSearched(true) ; 

    console.log("fetchSearchResults called with query:", query);

    try {
      const response = await axios(`${import.meta.env.VITE_API_URL}/qr/search-elastic?q=${encodeURIComponent(query)}`);

      console.log("search response: ", response);

      // setResults(response.data.data || []);

      setResults(Array.isArray(response.data.data.results) ? response.data.data.results : []);


    } catch (error) {
      setError(error.message || "Error searching");
      console.log("Fetch search results error: ", error);
      setResults([]);
    } finally {
      setLoading(false);
    }

  }

  // debouncing for larger screens 

  const debouncedFetch = useMemo(() => debounce(fetchSearchResults, 2000), []);

  useEffect(() => {

    // will be only searching if the user has stopped typing for 3 seconds 

    // if (isExpanded && searchQuery.trim()) {
    //   setLoading(true);

    //   const delayDebounce = setTimeout(() => {
    //     fetchSearchResults(searchQuery.trim());
    //   }, 2000);

    //   return () => clearTimeout(delayDebounce);
    // }
    // else {
    //   setResults([]);
    //   setLoading(false);
    // }

      if (isExpanded && searchQuery.trim()) {
      debouncedFetch(searchQuery.trim());
    } else {
      setResults([]);
      setLoading(false);
    }

    // Cancel debounce on unmount
    return () => {
      debouncedFetch.cancel();
    };


  }, [searchQuery, isExpanded])



  // debouncing for mobile searches 

  useEffect(() => {
    if (isMobile && isExpanded && searchQuery.trim()) {
      const delayDebounce = setTimeout(() => {
        fetchSearchResults(searchQuery.trim());
      }, 400);
      return () => clearTimeout(delayDebounce)
    }

    if (isMobile && !searchQuery.trim()) {
      setResults([])
    }

  }, [searchQuery, isExpanded, isMobile])

  const handleSearchClick = () => {
    if (!isExpanded) {
      onToggle(true);
    }
  };

  const handleContainerClick = () => {
    if (!isExpanded) {
      onToggle(true);
    } else {
      // If already expanded, allow click to collapse
      onToggle(false);
    }
  };

  const handleClose = () => {
    onToggle(false);
    setSearchQuery("");
    setIsFocused(false);
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    handleClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      handleClose();
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setHasSearched(false) ; // reset search flag on new input
  };
  console.log(isMobile, isCollapsed, isExpanded);

  const baseClasses = isMobile
    ? "transition-all duration-300 ease-in-out"
    : "transition-all duration-300 ease-in-out";

  const containerClasses = isMobile
    ? `${baseClasses} ${isCollapsed ? "w-12 h-12" : isExpanded ? "w-60" : "w-40"
    }`
    : `${baseClasses} ${"h-12 w-100"}`;

  return (
    <div className={containerClasses}>
      {isCollapsed && !isExpanded ? (
        /* Collapsed Icon State */
        <button
          onClick={handleContainerClick}
          className="w-full h-full bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer"
        >
          <FaSearch className="h-4 w-4" />
        </button>
      ) : (
        /* Normal/Expanded State */
        <div className="relative h-12">
          <div
            className={`relative flex items-center h-full bg-white rounded-lg border transition-all duration-300 ${isFocused || isExpanded
              ? "border-blue-500 shadow-lg"
              : "border-gray-300 hover:border-gray-400"
              }`}
            onClick={() => {
              if (!isExpanded) handleContainerClick();
            }}
          >
            <div className="pl-3 pr-2">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            {!isExpanded && (
              <span className="flex-1 text-gray-700 text-base font-semibold pr-3 truncate">
                Search products
              </span>
            )}
            {isExpanded && (
              <form onSubmit={handleSubmit} className="flex-1 flex items-center">
                <input
                  // ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Search products..."
                  className="flex-1 h-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm px-2"
                />
                <button
                  type="button"
                  onClick={handleCloseClick}
                  className="pr-3 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
                {/* Hidden submit button for Enter key */}
                <button type="submit" style={{ display: "none" }} />
              </form>
            )}
          </div>

          {/* displaying real search results */}

          {
            isExpanded && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                <div className="p-3">
                  {loading && <p className="text-sm text-gray-500">Loading...</p>}
                  {error && <p className="text-sm text-red-500">{error}</p>}

                  {/* if result not found - display no results found  */}

                  {!loading && !error && results.length === 0 && searchQuery.trim().length > 0 && hasSearched && (
                    <p className="text-sm text-gray-500">No results found.</p>
                  )}

                  {/* if found: results */}

                  <div className="space-y-2">
                    {
                      results.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => {
                            handleClose() ; 
                            navigate(`/product-detail/${item.code}`)
                          }}
                        >
                          <p className="text-sm text-gray-700 font-semibold">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Code: {item.code}
                          </p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )
          }

        </div>
      )}
    </div>
  );
};

export default Search;
