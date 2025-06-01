import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  FileText, 
  Download, 
  ExternalLink,
  Filter,
  Star,
  Clock,
  ChevronRight,
  Lightbulb,
  Target
} from 'lucide-react';
import { pdfProcessor } from '../lib/pdfProcessor';
import { SearchResult } from '../lib/vectorDatabase';

interface NCERTSolutionsProps {
  userId: string;
}

interface QuickAccess {
  subject: string;
  class: string;
  chapters: string[];
  icon: string;
}

const NCERTSolutions: React.FC<NCERTSolutionsProps> = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('12');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);

  // Quick access data
  const quickAccess: QuickAccess[] = [
    {
      subject: 'Mathematics',
      class: '12',
      chapters: ['Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices', 'Determinants'],
      icon: '📐'
    },
    {
      subject: 'Physics',
      class: '12',
      chapters: ['Electric Charges and Fields', 'Electrostatic Potential', 'Current Electricity', 'Moving Charges'],
      icon: '⚡'
    },
    {
      subject: 'Chemistry',
      class: '12',
      chapters: ['The Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics'],
      icon: '🧪'
    },
    {
      subject: 'Biology',
      class: '12',
      chapters: ['Reproduction in Organisms', 'Sexual Reproduction', 'Human Reproduction', 'Reproductive Health'],
      icon: '🧬'
    }
  ];

  const classes = ['6', '7', '8', '9', '10', '11', '12'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 'Geography'];

  // Load suggestions on component mount
  useEffect(() => {
    loadSuggestions();
    loadRecentSearches();
  }, [selectedSubject, selectedClass]);

  // Load subject-specific suggestions
  const loadSuggestions = async () => {
    try {
      const results = await pdfProcessor.getDocumentSuggestions(selectedSubject);
      setSuggestions(results.slice(0, 3));
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    const recent = localStorage.getItem('ncert_recent_searches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  };

  // Save search to recent searches
  const saveToRecentSearches = (query: string) => {
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('ncert_recent_searches', JSON.stringify(updated));
  };

  // Handle search
  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const filters = {
        subject: selectedSubject,
        userId: userId // Include user's uploaded documents
      };
      
      const results = await pdfProcessor.searchDocuments(searchTerm, filters);
      setSearchResults(results);
      saveToRecentSearches(searchTerm);
    } catch (error) {
      console.error('Error searching NCERT solutions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick chapter access
  const handleChapterClick = (chapter: string) => {
    const query = `${selectedSubject} Class ${selectedClass} ${chapter}`;
    setSearchQuery(query);
    handleSearch(query);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <BookOpen className="mr-3 h-8 w-8" />
              NCERT Solutions
            </h1>
            <p className="text-blue-100 mt-2">
              Find solutions from your uploaded documents and study materials
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Class {selectedClass}</div>
            <div className="text-blue-200">{selectedSubject}</div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-4">
          {/* Class and Subject Selection */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for questions, topics, or concepts..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={!searchQuery.trim() || isLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(search);
                      handleSearch(search);
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="mr-2 h-5 w-5" />
          Quick Access - Class {selectedClass}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccess.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">{item.icon}</span>
                <h3 className="font-medium text-gray-900">{item.subject}</h3>
              </div>
              <div className="space-y-2">
                {item.chapters.slice(0, 3).map((chapter, chapterIndex) => (
                  <button
                    key={chapterIndex}
                    onClick={() => handleChapterClick(chapter)}
                    className="w-full text-left text-sm text-gray-600 hover:text-blue-600 flex items-center justify-between group"
                  >
                    <span>{chapter}</span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
            Suggested Content for {selectedSubject}
          </h2>
          <div className="grid gap-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900">{suggestion.document.metadata.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {suggestion.document.metadata.subject}
                  </span>
                  {suggestion.document.metadata.chapter && (
                    <span>{suggestion.document.metadata.chapter}</span>
                  )}
                </div>
                <p className="text-gray-700 mt-2 text-sm">
                  {suggestion.relevantChunk.substring(0, 150)}...
                </p>
                <button
                  onClick={() => {
                    setSearchQuery(suggestion.document.metadata.title);
                    handleSearch(suggestion.document.metadata.title);
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Full Content →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Search Results ({searchResults.length})
          </h2>
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{result.document.metadata.title}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          {(result.score * 100).toFixed(1)}% match
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mb-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {result.document.metadata.subject}
                      </span>
                      {result.document.metadata.chapter && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          {result.document.metadata.chapter}
                        </span>
                      )}
                      <span>Page {result.document.metadata.page || 'N/A'}</span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-gray-700 leading-relaxed">
                        {result.relevantChunk}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <ExternalLink className="mr-1 h-4 w-4" />
                        View Full Document
                      </button>
                      <button className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm">
                        <Download className="mr-1 h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {searchQuery && searchResults.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-4">
            Try searching with different keywords or upload more documents to expand your library.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default NCERTSolutions;
