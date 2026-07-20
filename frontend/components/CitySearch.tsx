'use client';

import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface CitySearchProps{
    label: string;
    state: string;
    value: string;
    onChange: (city: string) => void;
    placeholder?: string;
    required?: boolean;
}

interface City {
    nome: string;
    codigo_ibge: string;
}

export function CitySearch({
    label,
    state,
    value,
    onChange,
    placeholder = 'Digite o nome da cidade...',
    required = false
    }: CitySearchProps) {
        const [inputValue, setInputValue] = useState(value || '');
        const [suggestions, setSuggestions] = useState<string[]>([]);
        const [allCities, setAllCities] = useState<string[]>([]);
        const [showSuggestions, setShowSuggestions] = useState(false);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const wrapperRef = useRef<HTMLDivElement>(null);

        // Flag to check if component is assembled
        const isMounted = useRef<boolean>(true);

        // Cleanup on unmount
        useEffect(() => {
            isMounted.current = true;
            return() => {
                isMounted.current = false;
            };
        }, []);
        
        //Search all cities when change state
        useEffect(() => {
            const loadCities = async () => {
                if (!state) {
                    if (isMounted){
                        setAllCities([]);
                        setSuggestions([]);
                        setInputValue('');
                    }
                    return;
                }

                setLoading(true);
                setError(null);

                try {
                    const response = await axios.get<City[]>(
                        `https://brasilapi.com.br/api/ibge/municipios/v1/${state}`
                    );
                    if (isMounted) {
                        const cities = response.data.map((item: City) => item.nome);
                        setAllCities(cities.sort());
                    }
                } catch (err) {
                    console.error('Erro ao buscar cidades:', err);
                    if (isMounted) {
                        setError('Erro ao carregar cidades');
                    }
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            };

            loadCities();
        }, [state, isMounted]);

        // Filter cities based  on input
        useEffect(() => {
            const filterCities = () => {
                if(inputValue.length < 2){
                    setSuggestions([]);
                    return;
                }

                const filtered = allCities.filter((city: string) =>
                    city.toLowerCase().includes(inputValue.toLowerCase())
                );
                setSuggestions(filtered.slice(0, 15));
            };

            filterCities();
        }, [inputValue, allCities]);

        //Close the dropdown when clicking outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)){
                    setShowSuggestions(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const handleInputChange = (text: string) => {
            setInputValue(text);
            setShowSuggestions(true);
            if (text === ''){
                onChange('');
            }
        };

        const handleSelectCity = (city: string) => {
            setInputValue(city);
            onChange(city);
            setShowSuggestions(false);
        };

        return(
            <div className="relative" ref={wrapperRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => {
                        if (state && allCities.length > 0){
                            setShowSuggestions(true);
                            setSuggestions(allCities.slice(0,10));
                        }
                    }}
                    placeholder={!state ? 'Selecione um Estado primeiro': placeholder}
                    className={`mt-1 block w-full border rounded-md p-2 ${
                        !state ? 'bg-gray-100 text-gray-500' : ''
                    }`}
                    disabled={!state}
                    required={required}
                />
                {! state && (
                    <p className="text-sm text-amber-600 mt-1">
                        Selecione um Estado primeiro!
                    </p>
                )}
                {error && (
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
                {loading && state && (
                    <div className="absolute z-10 w-full bg-white border rounded-md mt-1 p-3 text-gray-500 text-sm">
                        <svg className="animate-spin h-4 w-4 inline-block mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v0c5.37 3 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Carregando cidades...
                    </div>
                )}
                {showSuggestions && suggestions.length > 0 && !loading && (
                    <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {suggestions.map((city: string) => (
                            <li
                                key={city}
                                onClick={() => handleSelectCity(city)}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                            >
                                {city}
                            </li>
                        ))}
                        {suggestions.length === 15 && allCities.length > 15 && (
                            <li className="px-3 py-2 text-gray-500 text-sm italic bg-gray-50">
                                Digite mais para refinar...
                            </li>
                        )}
                    </ul>
                )}
                {showSuggestions && suggestions.length === 0 && inputValue.length >= 2 && !loading && allCities.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-md mt-1 p-3 text-gray-500 text-sm">
                        Nenhuma cidade encontrada para &quot;{inputValue}&quot;
                    </div>
                )}
            </div>
        );
    }