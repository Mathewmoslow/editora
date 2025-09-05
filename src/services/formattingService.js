import moment from 'moment';

// Academic formatting service for APA and MLA styles
export class AcademicFormatter {
  constructor(style = 'APA') {
    this.style = style.toUpperCase();
  }

  // Main formatting function
  formatDocument(content) {
    let formattedContent = content;
    
    // Apply basic formatting rules
    formattedContent = this.formatParagraphs(formattedContent);
    formattedContent = this.formatHeadings(formattedContent);
    formattedContent = this.formatCitations(formattedContent);
    formattedContent = this.formatQuotes(formattedContent);
    formattedContent = this.formatListsAndBibliography(formattedContent);
    
    return formattedContent;
  }

  // Format paragraphs according to APA/MLA standards
  formatParagraphs(content) {
    let formatted = content;
    
    // Remove extra spaces and normalize line breaks
    formatted = formatted.replace(/\s+/g, ' ');
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Split into paragraphs and format each
    const paragraphs = formatted.split('\n\n');
    const formattedParagraphs = paragraphs.map(paragraph => {
      if (!paragraph.trim()) return '';
      
      // Add proper indentation for first line (APA/MLA standard)
      if (this.style === 'APA') {
        return '    ' + paragraph.trim(); // 4 spaces or 0.5" indent
      } else if (this.style === 'MLA') {
        return '    ' + paragraph.trim(); // 4 spaces or 0.5" indent
      }
      return paragraph.trim();
    });
    
    return formattedParagraphs.filter(p => p.trim()).join('\n\n');
  }

  // Format headings according to style guide
  formatHeadings(content) {
    let formatted = content;
    
    if (this.style === 'APA') {
      // APA heading levels (simplified for plain text)
      formatted = formatted.replace(/^#\s+(.+)$/gm, '$1'); // Level 1 - Centered, Bold
      formatted = formatted.replace(/^##\s+(.+)$/gm, '$1'); // Level 2 - Flush Left, Bold
      formatted = formatted.replace(/^###\s+(.+)$/gm, '    $1'); // Level 3 - Indented, Bold
    } else if (this.style === 'MLA') {
      // MLA typically uses minimal headings
      formatted = formatted.replace(/^#+\s+(.+)$/gm, '$1');
    }
    
    return formatted;
  }

  // Format in-text citations
  formatCitations(content) {
    let formatted = content;
    
    if (this.style === 'APA') {
      // Convert common citation patterns to APA format
      // (Author, Year) or (Author Year)
      formatted = formatted.replace(/\((.*?),?\s*(\d{4})\)/g, '($1, $2)');
      
      // Direct quotes with page numbers
      formatted = formatted.replace(/\((.*?),?\s*(\d{4}),?\s*p\.?\s*(\d+)\)/g, '($1, $2, p. $3)');
      formatted = formatted.replace(/\((.*?),?\s*(\d{4}),?\s*pp\.?\s*(\d+)-(\d+)\)/g, '($1, $2, pp. $3-$4)');
      
    } else if (this.style === 'MLA') {
      // MLA format: (Author Page#)
      formatted = formatted.replace(/\((.*?),?\s*(\d{4}),?\s*p\.?\s*(\d+)\)/g, '($1 $3)');
      formatted = formatted.replace(/\((.*?),?\s*(\d{4}),?\s*pp\.?\s*(\d+)-(\d+)\)/g, '($1 $3-$4)');
    }
    
    return formatted;
  }

  // Format block quotes
  formatQuotes(content) {
    let formatted = content;
    
    // Format block quotes (40+ words for APA, varies for MLA)
    const blockQuotePattern = /^>\s*(.+)$/gm;
    
    if (this.style === 'APA') {
      formatted = formatted.replace(blockQuotePattern, '        $1'); // Double indent for block quotes
    } else if (this.style === 'MLA') {
      formatted = formatted.replace(blockQuotePattern, '        $1'); // Indent 1 inch from left margin
    }
    
    return formatted;
  }

  // Format reference lists and bibliographies
  formatListsAndBibliography(content) {
    let formatted = content;
    
    // Find reference/bibliography section
    const refPattern = /(References|Bibliography|Works Cited)\n([\s\S]*?)(?=\n[A-Z]|\n*$)/gi;
    
    formatted = formatted.replace(refPattern, (match, heading, refs) => {
      const formattedRefs = refs.split('\n')
        .filter(ref => ref.trim())
        .map(ref => this.formatReference(ref.trim()))
        .sort() // Alphabetical order
        .map(ref => ref.startsWith('    ') ? ref : '    ' + ref) // Hanging indent
        .join('\n');
      
      return `${heading}\n\n${formattedRefs}`;
    });
    
    return formatted;
  }

  // Format individual reference/citation
  formatReference(reference) {
    if (!reference) return '';
    
    if (this.style === 'APA') {
      return this.formatAPAReference(reference);
    } else if (this.style === 'MLA') {
      return this.formatMLAReference(reference);
    }
    
    return reference;
  }

  formatAPAReference(ref) {
    // Basic APA formatting patterns
    // This is a simplified version - real implementation would be more complex
    
    // Journal article pattern
    if (ref.includes('Journal') || ref.includes('Vol') || ref.includes('pp.')) {
      const parts = ref.split(/[.,]/).map(p => p.trim());
      // Format: Author, A. A. (Year). Title. Journal Name, Volume(Issue), pages.
    }
    
    // Book pattern
    if (ref.includes('Publisher') || ref.includes('Press')) {
      // Format: Author, A. A. (Year). Title. Publisher.
    }
    
    return ref;
  }

  formatMLAReference(ref) {
    // Basic MLA formatting patterns
    // Format: Author. "Title." Journal/Book, Publisher, Date, pages.
    return ref;
  }

  // Generate formatted title page
  generateTitlePage(title, author, institution, date = new Date()) {
    const formattedDate = moment(date).format('MMMM D, YYYY');
    
    if (this.style === 'APA') {
      return `





                                ${title}



                                ${author}
                                ${institution}
                                ${formattedDate}`;
    } else if (this.style === 'MLA') {
      return `${author}
Professor [Name]
[Course]
${formattedDate}

                                ${title}`;
    }
    
    return `${title}\n\n${author}\n${formattedDate}`;
  }

  // Validate formatting against style guide
  validateFormatting(content) {
    const issues = [];
    
    // Check common formatting issues
    if (content.includes('\t')) {
      issues.push('Use spaces instead of tabs for indentation');
    }
    
    if (content.match(/\n{4,}/)) {
      issues.push('Excessive line breaks found');
    }
    
    if (this.style === 'APA') {
      // Check APA-specific rules
      if (!content.includes('References') && content.includes('(')) {
        issues.push('Document appears to have citations but no References section');
      }
      
      // Check for proper APA citation format
      const invalidCitations = content.match(/\([^)]*\d{4}[^)]*\)/g);
      if (invalidCitations) {
        issues.push('Some citations may not follow APA format');
      }
    }
    
    if (this.style === 'MLA') {
      // Check MLA-specific rules
      if (!content.includes('Works Cited') && content.includes('(')) {
        issues.push('Document appears to have citations but no Works Cited section');
      }
    }
    
    return issues;
  }
}

// Export convenience functions
export const formatAPA = (content, options = {}) => {
  const formatter = new AcademicFormatter('APA');
  return formatter.formatDocument(content);
};

export const formatMLA = (content, options = {}) => {
  const formatter = new AcademicFormatter('MLA');
  return formatter.formatDocument(content);
};

export const validateAcademicFormat = (content, style = 'APA') => {
  const formatter = new AcademicFormatter(style);
  return formatter.validateFormatting(content);
};

export const generateTitlePage = (title, author, institution, style = 'APA') => {
  const formatter = new AcademicFormatter(style);
  return formatter.generateTitlePage(title, author, institution);
};