export interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishDate: string;
  journal: string;
  doi?: string;
  keywords: string[];
}

export interface Filters {
  cancerTypes: string[];
  articleTypes: string[];
}

export const CANCER_TYPES = [
  'Cancer',
  'Breast Cancer',
  'Lung Cancer',
  'Prostate Cancer',
  'Colorectal Cancer',
  'Melanoma',
  'Leukemia',
  'Lymphoma',
  'Brain Cancer',
  'Ovarian Cancer',
  'Pancreatic Cancer'
] as const;

export const ARTICLE_TYPES = [
  'Clinical Trial',
  'Review',
  'Case Report',
  'Research Article',
  'Meta-Analysis',
  'Systematic Review'
] as const;