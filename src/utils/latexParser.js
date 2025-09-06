// Generate truly unique IDs
let idCounter = 0;
const generateUniqueId = () => {
  idCounter++;
  return `chapter_${Date.now()}_${idCounter}_${Math.random().toString(36).substr(2, 9)}`;
};

export const parseLatexToChapters = (latexContent) => {
  const chapters = [];
  
  // Remove comments
  const cleanContent = latexContent.replace(/%.*$/gm, '');
  
  // Split by chapters
  const chapterRegex = /\\(chapter|section|part)\*?\{([^}]+)\}/g;
  const chapterMatches = [...cleanContent.matchAll(chapterRegex)];
  
  if (chapterMatches.length === 0) {
    // If no chapters found, treat entire content as one chapter
    return [{
      id: generateUniqueId(),
      title: 'Imported Document',
      content: cleanLatexToPlainText(cleanContent)
    }];
  }
  
  // Extract chapters with their content
  for (let i = 0; i < chapterMatches.length; i++) {
    const match = chapterMatches[i];
    const title = match[2].trim();
    const startIndex = match.index + match[0].length;
    const endIndex = i < chapterMatches.length - 1 
      ? chapterMatches[i + 1].index 
      : cleanContent.length;
    
    const content = cleanContent.substring(startIndex, endIndex);
    
    chapters.push({
      id: generateUniqueId(),
      title: cleanLatexToPlainText(title),
      content: cleanLatexToPlainText(content)
    });
  }
  
  return chapters;
};

const cleanLatexToPlainText = (text) => {
  // Remove common LaTeX commands
  let cleaned = text
    // Remove document class and packages
    .replace(/\\documentclass\[.*?\]\{.*?\}/g, '')
    .replace(/\\documentclass\{.*?\}/g, '')
    .replace(/\\usepackage\[.*?\]\{.*?\}/g, '')
    .replace(/\\usepackage\{.*?\}/g, '')
    // Remove begin/end document
    .replace(/\\begin\{document\}/g, '')
    .replace(/\\end\{document\}/g, '')
    // Convert LaTeX formatting to plain text
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    .replace(/\\textit\{([^}]+)\}/g, '$1')
    .replace(/\\emph\{([^}]+)\}/g, '$1')
    .replace(/\\underline\{([^}]+)\}/g, '$1')
    // Handle quotes
    .replace(/``/g, '"')
    .replace(/''/g, '"')
    .replace(/`/g, "'")
    // ENHANCED paragraph handling for LaTeX - preserve natural structure
    .replace(/\\par\s+/g, '\n\n')
    .replace(/\\paragraph\{[^}]*\}/g, '\n\n')
    // Detect natural paragraph patterns in LaTeX source
    .replace(/\.\s*\n\s*[A-Z]/g, (match) => {
      // Sentence ending followed by new sentence = likely paragraph break
      return match.replace(/\n/, '\n\n');
    })
    // Look for natural transition indicators in any writing style
    .replace(/\.\s+(However|Therefore|Furthermore|Moreover|Additionally|In contrast|Meanwhile|Subsequently|Consequently|Nevertheless|Then|Next|Later|Finally|Suddenly|But|And then|After that|Soon|Eventually|At that moment)\s+/g, '.\n\n$1 ')
    // Detect dialogue changes (common in fiction/memoir)
    .replace(/\"\s+\"[A-Z]/g, (match) => match.replace(/\"\s+\"/, '"\n\n"'))
    // Detect scene/time transitions
    .replace(/\.\s+(The next day|The following morning|Years later|Hours passed|Meanwhile|Back at|Elsewhere|At the same time)\s+/g, '.\n\n$1 ')
    .replace(/\n\s*\n/g, '\n\n') // Preserve existing paragraph breaks
    // Handle line breaks that aren't paragraph breaks
    .replace(/\\\\/g, '\n')
    .replace(/\\newline/g, '\n')
    // Remove LaTeX references but preserve structure
    .replace(/\\label\{[^}]+\}/g, '')
    .replace(/\\ref\{[^}]+\}/g, '[REF]')
    .replace(/\\cite\{[^}]+\}/g, '[CITE]')
    // Handle lists with proper spacing
    .replace(/\\begin\{itemize\}/g, '\n\n')
    .replace(/\\end\{itemize\}/g, '\n\n')
    .replace(/\\begin\{enumerate\}/g, '\n\n')
    .replace(/\\end\{enumerate\}/g, '\n\n')
    .replace(/\\item\s+/g, '\n• ')
    // Handle footnotes
    .replace(/\\footnote\{([^}]+)\}/g, ' ($1)')
    // Remove LaTeX commands but preserve content structure
    .replace(/\\[a-zA-Z]+\*?\{/g, '{')
    .replace(/\\[a-zA-Z]+\*?\s+/g, ' ')
    
  // SMARTER paragraph detection - identify blocks needing writer-style breaks
  cleaned = cleaned
    .replace(/\s*\n\s*/g, '\n') // Clean line breaks
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    
  // If text has very few paragraph breaks, suggest it needs AI paragraph analysis
  const paragraphCount = (cleaned.match(/\n\n/g) || []).length;
  const wordCount = cleaned.split(/\s+/).length;
  
  if (paragraphCount < 2 && wordCount > 200) {
    // Mark this content as needing paragraph break suggestions
    cleaned = `[NEEDS_PARAGRAPH_ANALYSIS]\n${cleaned}`;
  }
  
  return cleaned.trim();
};

export const parseMultipleTexFiles = (files) => {
  const allChapters = [];
  
  files.forEach((file, fileIndex) => {
    const chapters = parseLatexToChapters(file.content);
    // If file has a name, use it as a prefix for chapter titles
    if (file.name && chapters.length === 1 && chapters[0].title === 'Imported Document') {
      chapters[0].title = file.name.replace(/\.tex$/i, '');
    }
    
    // Ensure each chapter has a unique ID even when processing multiple files
    chapters.forEach(chapter => {
      allChapters.push({
        ...chapter,
        id: generateUniqueId() // Generate new unique ID for each chapter
      });
    });
  });
  
  return allChapters;
};