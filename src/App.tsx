import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Microscope, BookOpen } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { ArticleCard } from './components/ArticleCard';
import { LoadingState } from './components/LoadingState';
import { FilterPanel } from './components/FilterPanel';
import { searchArticles } from './services/pubmedApi';
import type { Article, Filters } from './types';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    cancerTypes: ['Cancer'],
    articleTypes: []
  });
  
  const observer = useRef<IntersectionObserver>();
  const lastArticleRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prev => prev + 1);
      }
    });
    
    if (node) {
      observer.current.observe(node);
    }
  }, [isLoading, hasMore]);

  useEffect(() => {
    document.title = searchQuery
      ? `${searchQuery} - Oncology Research Hub`
      : 'Oncology Research Hub | Latest Cancer Research Articles';
  }, [searchQuery]);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const { articles: fetchedArticles, total } = await searchArticles(
          searchQuery,
          currentPage,
          filters
        );
        
        if (currentPage === 1) {
          setArticles(fetchedArticles);
        } else {
          setArticles(prev => [...prev, ...fetchedArticles]);
        }
        
        setTotalResults(total);
        setHasMore(articles.length < total);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [searchQuery, currentPage, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setArticles([]);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    const updatedFilters = {
      ...newFilters,
      cancerTypes: newFilters.cancerTypes.includes('Cancer') 
        ? newFilters.cancerTypes 
        : ['Cancer', ...newFilters.cancerTypes]
    };
    setFilters(updatedFilters);
    setCurrentPage(1);
    setArticles([]);
  };

  const activeFiltersCount = filters.cancerTypes.length + filters.articleTypes.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Microscope className="w-10 h-10" />
                <div>
                  <h1 className="text-3xl font-bold">Oncology Research Hub</h1>
                  <p className="text-sm text-blue-100">Curating the Latest Advances in Cancer Research</p>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#latest" className="text-blue-100 hover:text-white transition-colors">Latest Research</a>
                <a href="#clinical-trials" className="text-blue-100 hover:text-white transition-colors">Clinical Trials</a>
                <a href="#about" className="text-blue-100 hover:text-white transition-colors">About</a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar
            query={searchQuery}
            onQueryChange={handleSearch}
            onFilterClick={() => setShowFilters(true)}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterPanel
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Latest Research Articles
            {totalResults > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({totalResults.toLocaleString()} results)
              </span>
            )}
          </h2>
        </div>

        <div className="article-grid">
          {articles.map((article, index) => {
            if (articles.length === index + 1) {
              return (
                <div key={article.id} ref={lastArticleRef}>
                  <ArticleCard article={article} />
                </div>
              );
            }
            return <ArticleCard key={article.id} article={article} />;
          })}
        </div>

        {articles.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Microscope className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No articles found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="mt-8">
            <LoadingState />
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Oncology Research Hub</h3>
              <p className="text-gray-400">
                Dedicated to providing the latest peer-reviewed cancer research articles and clinical trials to healthcare professionals and researchers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#latest" className="hover:text-white transition-colors">Latest Research</a></li>
                <li><a href="#clinical-trials" className="hover:text-white transition-colors">Clinical Trials</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
              <p className="text-gray-400">
                Powered by PubMed's E-utilities API. Updated in real-time with the latest oncology research.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;