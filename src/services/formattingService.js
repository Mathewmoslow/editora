import moment from 'moment';

// STRICT Academic formatting service - ONLY changes structure, never content
export class StrictAcademicFormatter {
  constructor(style = 'APA') {
    this.style = style.toUpperCase();
  }

  // Main formatting function - PRESERVES all content, only changes structure
  formatDocument(content) {
    let formattedContent = content;
    
    // ONLY structural changes - no content editing
    formattedContent = this.formatParagraphStructure(formattedContent);
    formattedContent = this.formatHeadingStructure(formattedContent);
    formattedContent = this.formatCitationStructure(formattedContent);
    formattedContent = this.formatQuoteStructure(formattedContent);
    formattedContent = this.formatReferencesStructure(formattedContent);
    
    return formattedContent;
  }

  // Format paragraph structure ONLY (indentation, spacing)
  formatParagraphStructure(content) {
    // Split into paragraphs, preserve all content
    const paragraphs = content.split(/\n\s*\n/);
    
    const formattedParagraphs = paragraphs.map(paragraph => {
      if (!paragraph.trim()) return '';
      
      // Remove existing indentation and apply standard academic indentation
      const cleanParagraph = paragraph.replace(/^\s+/gm, '').trim();
      
      // Apply proper academic indentation (both APA and MLA use 0.5" first line indent)
      return '    ' + cleanParagraph; // 4 spaces = 0.5" in most editors
    });
    
    // Use double line spacing between paragraphs (academic standard)
    return formattedParagraphs.filter(p => p.trim()).join('\n\n');
  }

  // Format heading structure ONLY
  formatHeadingStructure(content) {
    let formatted = content;
    
    if (this.style === 'APA') {
      // APA heading levels - only change position/format, not content
      // Level 1: Centered, Bold, Title Case
      formatted = formatted.replace(/^#{1}\s+(.+)$/gm, (match, title) => {
        return `                    ${title}`; // Centered approximation
      });
      
      // Level 2: Flush Left, Bold, Title Case
      formatted = formatted.replace(/^#{2}\s+(.+)$/gm, '$1');
      
      // Level 3: Flush Left, Bold Italic, Title Case
      formatted = formatted.replace(/^#{3}\s+(.+)$/gm, '$1');
      
    } else if (this.style === 'MLA') {
      // MLA typically doesn't use many headings, keep simple
      formatted = formatted.replace(/^#{1,6}\s+(.+)$/gm, '$1');
    }
    
    return formatted;
  }

  // Format citation structure ONLY - fix spacing and punctuation, preserve content
  formatCitationStructure(content) {
    let formatted = content;
    
    if (this.style === 'APA') {
      // Fix APA citation spacing - preserve all author names and dates
      formatted = formatted.replace(/\(\s*([^)]+?)\s*,\s*(\d{4})\s*\)/g, '($1, $2)');
      formatted = formatted.replace(/\(\s*([^)]+?)\s*,?\s*(\d{4})\s*,?\s*p\.?\s*(\d+)\s*\)/g, '($1, $2, p. $3)');
      formatted = formatted.replace(/\(\s*([^)]+?)\s*,?\s*(\d{4})\s*,?\s*pp\.?\s*(\d+)-?(\d+)\s*\)/g, '($1, $2, pp. $3-$4)');
      
    } else if (this.style === 'MLA') {
      // Fix MLA citation format - preserve content, fix structure
      formatted = formatted.replace(/\(\s*([^)]+?)\s*,?\s*(\d{4})?\s*,?\s*p\.?\s*(\d+)\s*\)/g, '($1 $3)');
      formatted = formatted.replace(/\(\s*([^)]+?)\s*,?\s*(\d{4})?\s*,?\s*pp\.?\s*(\d+)-?(\d+)\s*\)/g, '($1 $3-$4)');
    }
    
    return formatted;
  }

  // Format quote structure ONLY
  formatQuoteStructure(content) {
    let formatted = content;
    
    // Handle block quotes - only change indentation, preserve content
    const lines = formatted.split('\n');
    const formattedLines = lines.map(line => {
      if (line.trim().startsWith('>')) {
        // Remove > marker and apply block quote indentation
        const quoteContent = line.replace(/^\s*>\s*/, '').trim();
        if (quoteContent) {
          return '        ' + quoteContent; // Double indent for block quotes
        }
      }
      return line;
    });
    
    return formattedLines.join('\n');
  }

  // Format references/bibliography structure ONLY
  formatReferencesStructure(content) {
    let formatted = content;
    
    // Find reference sections and apply hanging indent
    const refSectionPattern = /(References|Bibliography|Works Cited)\n([\s\S]*?)(?=\n[A-Z][^a-z]|\n*$)/gi;
    
    formatted = formatted.replace(refSectionPattern, (match, heading, refs) => {
      const refLines = refs.split('\n').filter(line => line.trim());
      
      // Apply hanging indent to each reference (preserve content)
      const formattedRefs = refLines.map(ref => {
        const cleanRef = ref.trim();
        if (cleanRef) {
          // First line flush left, subsequent lines indented (hanging indent)
          return cleanRef.replace(/^\s+/, ''); // Remove any existing indentation
        }
        return ref;
      }).join('\n        '); // Hanging indent continuation
      
      return `${heading}\n\n${formattedRefs}`;
    });
    
    return formatted;
  }

  // Generate title page structure (separate from content)
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

  // Analyze formatting issues WITHOUT changing content
  analyzeFormatting(content) {
    const issues = [];
    const suggestions = [];
    
    // Check paragraph structure
    const paragraphs = content.split(/\n\s*\n/);
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim() && !paragraph.match(/^\s{4}/)) {
        issues.push(`Paragraph ${index + 1}: Missing first-line indentation`);
        suggestions.push(`Add 4-space indentation to paragraph ${index + 1}`);
      }
    });
    
    // Check citation format
    const citations = content.match(/\([^)]*\d{4}[^)]*\)/g) || [];
    citations.forEach(citation => {
      if (this.style === 'APA' && !citation.match(/\([^,]+,\s*\d{4}(\s*,\s*pp?\.\s*\d+(-\d+)?)?\)/)) {
        issues.push(`Citation format issue: ${citation}`);
        suggestions.push(`Fix APA citation format: ${citation}`);
      }
      if (this.style === 'MLA' && !citation.match(/\([^)]+\s+\d+(-\d+)?\)/)) {
        issues.push(`Citation format issue: ${citation}`);
        suggestions.push(`Fix MLA citation format: ${citation}`);
      }
    });
    
    // Check reference section
    if (content.includes('(') && !content.match(/(References|Bibliography|Works Cited)/i)) {
      issues.push('Document has citations but no reference section');
      suggestions.push('Add a References section (APA) or Works Cited section (MLA)');
    }
    
    return { issues, suggestions };
  }
}

// Export strict formatting functions that ONLY change structure
export const formatAPA = (content) => {
  const formatter = new StrictAcademicFormatter('APA');
  return formatter.formatDocument(content);
};

export const formatMLA = (content) => {
  const formatter = new StrictAcademicFormatter('MLA');
  return formatter.formatDocument(content);
};

export const analyzeAcademicFormat = (content, style = 'APA') => {
  const formatter = new StrictAcademicFormatter(style);
  return formatter.analyzeFormatting(content);
};

export const generateTitlePage = (title, author, institution, style = 'APA') => {
  const formatter = new StrictAcademicFormatter(style);
  return formatter.generateTitlePage(title, author, institution);
};