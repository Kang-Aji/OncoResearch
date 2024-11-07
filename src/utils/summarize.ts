export function extractSummary(text: string, sentenceCount: number = 3): string {
  if (!text) return '';
  
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length <= sentenceCount) return text;
  
  // Score sentences based on position and keyword frequency
  const scored = sentences.map((sentence, index) => ({
    text: sentence.trim(),
    score: scoreSentence(sentence, index, sentences.length)
  }));
  
  // Return top N sentences in original order
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount)
    .sort((a, b) => sentences.indexOf(a.text) - sentences.indexOf(b.text))
    .map(s => s.text)
    .join(' ');
}

function scoreSentence(sentence: string, position: number, total: number): number {
  let score = 0;
  
  // Position scoring (first and last sentences often contain key information)
  if (position === 0) score += 0.3;
  if (position === total - 1) score += 0.2;
  
  // Length scoring (avoid very short sentences)
  const words = sentence.split(/\s+/).length;
  if (words > 5 && words < 25) score += 0.2;
  
  // Keyword scoring
  const keywords = [
    'significant', 'conclusion', 'demonstrate', 'results', 'found', 'study',
    'important', 'novel', 'discovery', 'breakthrough', 'treatment', 'therapy',
    'survival', 'outcome', 'efficacy', 'clinical', 'trial', 'analysis'
  ];
  
  score += keywords.filter(word => 
    sentence.toLowerCase().includes(word)
  ).length * 0.1;
  
  return score;
}