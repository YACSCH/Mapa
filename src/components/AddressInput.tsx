import { useState, useEffect, useRef, useCallback } from 'react';
import { searchAddresses } from '../services/geocodingService';
import type { GeocodedLocation } from '../types';
import './AddressInput.css';

interface AddressInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: GeocodedLocation) => void;
  disabled?: boolean;
}

export function AddressInput({
  id,
  placeholder,
  value,
  onChange,
  onSelect,
  disabled = false,
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    try {
      const results = await searchAddresses(query, controller.signal);
      if (!controller.signal.aborted) {
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      }
    } catch {
      if (!controller.signal.aborted) {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(suggestion: GeocodedLocation) {
    onChange(suggestion.displayName);
    onSelect(suggestion);
    setShowDropdown(false);
    setSuggestions([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  }

  return (
    <div className="address-input" ref={wrapperRef}>
      <input
        ref={inputRef}
        id={id}
        className="address-input__field"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
      />
      {isLoading && <span className="address-input__spinner" />}
      {showDropdown && suggestions.length > 0 && (
        <ul className="address-input__dropdown">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="address-input__option"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
