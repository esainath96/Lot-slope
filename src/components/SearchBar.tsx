import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { searchAddressOptions, type AddressOption } from '../lib/api';

type SearchBarProps = {
  onSearch: (address: string) => void;
  isLoading: boolean;
};

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<AddressOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      if (query.trim().length >= 3) {
        const results = await searchAddressOptions(query);
        setOptions(results);
        setShowDropdown(true);
      } else {
        setOptions([]);
        setShowDropdown(false);
      }
    };

    const debounceTimer = setTimeout(fetchOptions, 500);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      onSearch(query);
    }
  };

  const handleSelect = (address: string) => {
    setQuery(address);
    setShowDropdown(false);
    onSearch(address);
  };

  return (
    <div ref={wrapperRef} style={{ flex: 1, position: 'relative' }}>
      <form onSubmit={handleSubmit} className="flex-row-to-col">
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '3rem' }}
            placeholder="Enter an address or lot..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (options.length > 0) setShowDropdown(true);
            }}
          />
        </div>
        <button type="submit" className="btn" disabled={isLoading || !query.trim()}>
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && options.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: '120px', // leave room for button
          marginTop: '0.5rem',
          background: 'var(--panel-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--panel-border)',
          borderRadius: '8px',
          boxShadow: 'var(--glass-shadow)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {options.map((opt) => (
            <div
              key={opt.place_id}
              onClick={() => handleSelect(opt.display_name)}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <MapPin size={16} color="var(--accent-color)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {opt.display_name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
