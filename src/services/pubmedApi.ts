import { Article, Filters } from '../types';

const API_KEY = '13c39e132686485298ec1823df0ec9564108';
const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

interface PubMedArticle {
  uid: string;
  title: string;
  authors: Array<{ name: string }>;
  abstract: string;
  pubdate: string;
  source: string;
  doi?: string;
  keywords: string[];
}

export async function searchArticles(
  query: string = '',
  page: number = 1,
  filters: Filters
): Promise<{
  articles: Article[];
  total: number;
}> {
  const retmax = 9; // articles per page
  const start = (page - 1) * retmax;
  
  // Build advanced search query
  let searchTerms = [];
  
  // Add user search query if provided
  if (query.trim()) {
    searchTerms.push(`(${query})`);
  }
  
  // Add cancer type filters
  if (filters.cancerTypes.length > 0) {
    const cancerTypesQuery = filters.cancerTypes
      .map(type => `"${type}"[Title/Abstract]`)
      .join(' OR ');
    searchTerms.push(`(${cancerTypesQuery})`);
  }

  // Add article type filters
  if (filters.articleTypes.length > 0) {
    const articleTypesQuery = filters.articleTypes
      .map(type => `"${type}"[Publication Type]`)
      .join(' OR ');
    searchTerms.push(`(${articleTypesQuery})`);
  }

  const searchTerm = searchTerms.join(' AND ');
  
  // First, search for IDs
  const searchUrl = `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmax=${retmax}&retstart=${start}&api_key=${API_KEY}&retmode=json&sort=date`;
  
  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();
  
  if (!searchData.esearchresult?.idlist?.length) {
    return { articles: [], total: 0 };
  }

  // Then, fetch details for those IDs
  const ids = searchData.esearchresult.idlist.join(',');
  const summaryUrl = `${BASE_URL}/esummary.fcgi?db=pubmed&id=${ids}&api_key=${API_KEY}&retmode=json`;
  
  const summaryResponse = await fetch(summaryUrl);
  const summaryData = await summaryResponse.json();

  const articles: Article[] = Object.values(summaryData.result || {})
    .filter((article: any) => article.uid)
    .map((article: PubMedArticle) => ({
      id: article.uid,
      title: article.title || 'Untitled',
      authors: article.authors?.map(author => author.name) || [],
      abstract: article.abstract || 'No abstract available',
      publishDate: article.pubdate,
      journal: article.source || 'Unknown Journal',
      doi: article.doi,
      keywords: article.keywords || []
    }));

  return {
    articles,
    total: parseInt(searchData.esearchresult.count) || 0
  };
}