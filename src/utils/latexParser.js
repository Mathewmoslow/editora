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
    // Handle paragraphs
    .replace(/\\par\s+/g, '\n\n')
    // Handle line breaks
    .replace(/\\\\/g, '\n')
    .replace(/\\newline/g, '\n')
    // Remove labels and refs
    .replace(/\\label\{[^}]+\}/g, '')
    .replace(/\\ref\{[^}]+\}/g, '')
    .replace(/\\cite\{[^}]+\}/g, '')
    // Handle lists
    .replace(/\\begin\{itemize\}/g, '')
    .replace(/\\end\{itemize\}/g, '')
    .replace(/\\begin\{enumerate\}/g, '')
    .replace(/\\end\{enumerate\}/g, '')
    .replace(/\\item\s+/g, '• ')
    // Handle footnotes
    .replace(/\\footnote\{([^}]+)\}/g, ' ($1)')
    // Remove other common commands
    .replace(/\\[a-zA-Z]+\*?\{/g, '{')
    .replace(/\\[a-zA-Z]+\*?\s+/g, ' ')
    // Clean up multiple spaces and newlines
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return cleaned;
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