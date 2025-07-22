import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useSport } from "@/contexts/sport-context";
import type { Prop } from "@shared/schema";

interface SmartSearchProps {
  props: Prop[];
  onFilter: (filteredProps: Prop[]) => void;
}

export function SmartSearch({ props, onFilter }: SmartSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { selectedSport } = useSport();

  // Sport-specific keywords and abbreviations
  const sportKeywords = useMemo(() => {
    const common = {
      NFL: [
        'passing yards', 'pass yds', 'passing tds', 'pass td',
        'rushing yards', 'rush yds', 'rushing tds', 'rush td',
        'receiving yards', 'rec yds', 'receptions', 'rec',
        'field goals', 'fg', 'touchdowns', 'td'
      ],
      NBA: [
        'points', 'pts', 'rebounds', 'reb', 'assists', 'ast',
        'steals', 'stl', 'blocks', 'blk', 'threes', '3pt',
        'free throws', 'ft', 'turnovers', 'to'
      ],
      MLB: [
        'hits', 'home runs', 'hr', 'rbis', 'rbi', 'runs',
        'strikeouts', 'k', 'so', 'walks', 'bb', 'stolen bases', 'sb',
        'doubles', '2b', 'triples', '3b', 'batting average', 'avg',
        'total bases', 'bases', 'hits + runs + rbis'
      ]
    };
    return common[selectedSport as keyof typeof common] || [];
  }, [selectedSport]);

  // Extract available prop types from current props
  const availablePropTypes = useMemo(() => {
    const types = props.map(prop => prop.propType.toLowerCase());
    return Array.from(new Set(types));
  }, [props]);

  // Generate suggestions based on search term
  const generateSuggestions = (term: string) => {
    if (!term || term.length < 2) return [];
    
    const lowerTerm = term.toLowerCase();
    const matches: string[] = [];
    
    // Match sport keywords
    sportKeywords.forEach(keyword => {
      if (keyword.includes(lowerTerm) && !matches.includes(keyword)) {
        matches.push(keyword);
      }
    });
    
    // Match available prop types
    availablePropTypes.forEach(propType => {
      if (propType.includes(lowerTerm) && !matches.includes(propType)) {
        matches.push(propType);
      }
    });
    
    // Match player names
    props.forEach(prop => {
      if (prop.playerName.toLowerCase().includes(lowerTerm) && !matches.includes(prop.playerName)) {
        matches.push(prop.playerName);
      }
    });
    
    return matches.slice(0, 5);
  };

  // Filter props based on search term
  const filterProps = useMemo(() => {
    if (!searchTerm.trim()) return props;
    
    const lowerSearch = searchTerm.toLowerCase();
    
    return props.filter(prop => {
      // Match player name
      if (prop.playerName.toLowerCase().includes(lowerSearch)) return true;
      
      // Match prop type
      if (prop.propType.toLowerCase().includes(lowerSearch)) return true;
      
      // Match sport keywords
      const propTypeLower = prop.propType.toLowerCase();
      return sportKeywords.some(keyword => {
        if (keyword.includes(lowerSearch)) {
          // Check if this keyword relates to the prop type
          const keywordParts = keyword.split(' ');
          return keywordParts.some(part => propTypeLower.includes(part));
        }
        return false;
      });
    });
  }, [searchTerm, props, sportKeywords]);

  // Update suggestions when search term changes
  useEffect(() => {
    setSuggestions(generateSuggestions(searchTerm));
  }, [searchTerm]);

  // Update filtered props
  useEffect(() => {
    onFilter(filterProps);
  }, [filterProps]);

  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <Input
          type="text"
          placeholder={`Search ${selectedSport} props...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 bg-dark-secondary border-dark-tertiary text-text-primary placeholder:text-text-secondary"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Search suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-dark-secondary border border-dark-tertiary rounded-md shadow-lg z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => selectSuggestion(suggestion)}
              className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-dark-tertiary first:rounded-t-md last:rounded-b-md"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {/* Active search indicator */}
      {searchTerm && (
        <div className="mt-2">
          <Badge variant="secondary" className="bg-accent-green/20 text-accent-green">
            Filtering: {searchTerm}
          </Badge>
          <span className="ml-2 text-sm text-text-secondary">
            {filterProps.length} of {props.length} props
          </span>
        </div>
      )}
    </div>
  );
}