import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ExternalLink, BookOpen, Calendar, Users, ChevronDown, ChevronUp, Link2, Share2, Bookmark } from 'lucide-react';
import { CANCER_TYPES } from '../types';
import { extractSummary } from '../utils/summarize';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => {
    const bookmarks = localStorage.getItem('bookmarks');
    return bookmarks ? JSON.parse(bookmarks).includes(article.id) : false;
  });
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  const summary = useMemo(() => 
    extractSummary(article.abstract, 2)
      .split('. ')
      .filter(Boolean)
      .map(sentence => sentence.trim() + '.'), 
    [article.abstract]
  );

  const getPubMedLink = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id}`;
  const getDoiLink = (doi: string) => `https://doi.org/${doi}`;

  const cancerTypes = useMemo(() => {
    return CANCER_TYPES.filter(type => 
      type !== 'Cancer' && 
      (article.title.toLowerCase().includes(type.toLowerCase()) ||
       article.abstract.toLowerCase().includes(type.toLowerCase()))
    );
  }, [article]);

  const handleBookmark = () => {
    const bookmarks = localStorage.getItem('bookmarks');
    const currentBookmarks = bookmarks ? JSON.parse(bookmarks) : [];
    
    if (isBookmarked) {
      const newBookmarks = currentBookmarks.filter((id: string) => id !== article.id);
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    } else {
      const newBookmarks = [...currentBookmarks, article.id];
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    }
    
    setIsBookmarked(!isBookmarked);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShowCopyMessage(true);
        setTimeout(() => setShowCopyMessage(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleShare = async () => {
    const url = getPubMedLink(article.id);
    const shareData = {
      title: article.title,
      text: `Check out this research article: ${article.title}`,
      url
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await copyToClipboard(url);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        await copyToClipboard(url);
      }
    }
  };

  return (
    <article 
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 ${
        isBookmarked ? 'ring-2 ring-primary ring-opacity-50' : ''
      }`}
    >
      <div className="p-6">
        {cancerTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {cancerTypes.map((type) => (
              <span
                key={type}
                className="px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-600 font-medium border border-red-100"
              >
                {type}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {article.keywords.slice(0, 3).map((keyword) => (
            <span
              key={keyword}
              className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-primary-light font-medium"
            >
              {keyword}
            </span>
          ))}
        </div>

        <h2 
          className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 hover:line-clamp-none cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {article.title}
        </h2>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-primary" />
            {format(new Date(article.publishDate), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-primary" />
            {article.journal}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-primary" />
            {article.authors.slice(0, 3).join(', ')}
            {article.authors.length > 3 && ' et al.'}
          </div>
        </div>

        <div className="space-y-4">
          {!isExpanded && (
            <div className="text-gray-700">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Key Points:</h3>
              <ul className="space-y-2 list-disc list-inside">
                {summary.map((point, index) => (
                  <li key={index} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>
          )}
          
          <p className={`text-gray-700 ${isExpanded ? '' : 'hidden'}`}>
            {article.abstract}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t mt-4">
          <a
            href={getPubMedLink(article.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors rounded-md"
          >
            <Link2 className="w-4 h-4" />
            View on PubMed
          </a>
          
          {article.doi && (
            <a
              href={getDoiLink(article.doi)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-blue-50 hover:bg-blue-100 transition-colors rounded-md"
            >
              <ExternalLink className="w-4 h-4" />
              Full Article
            </a>
          )}

          <div className="ml-auto flex items-center gap-2 relative">
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="Share article"
            >
              <Share2 className="w-5 h-5" />
            </button>
            
            {showCopyMessage && (
              <div className="absolute -top-10 right-0 bg-gray-800 text-white text-sm px-3 py-1 rounded shadow-lg">
                Link copied!
              </div>
            )}
            
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked 
                  ? 'text-primary bg-blue-50 hover:bg-blue-100' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            >
              <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}