import OpenAI from 'openai';

// Initialize OpenAI client only if API key is available
let openai = null;

const initializeOpenAI = () => {
  // Use REACT_APP_OPENAI_API_KEY which will be set by the build script
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  
  if (!openai && apiKey) {
    try {
      openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Only for development - in production, use a backend server
      });
    } catch (error) {
      console.log('OpenAI initialization skipped - no API key provided');
      openai = null;
    }
  }
  return openai;
};

export const getAISuggestions = async (content, type = 'general') => {
  const client = initializeOpenAI();
  
  if (!client) {
    return [{
      id: Date.now(),
      type: 'info',
      text: 'AI features are not configured. To enable AI suggestions, add your OpenAI API key to the .env.local file: OPENAI_API_KEY=your-key-here or REACT_APP_OPENAI_API_KEY=your-key-here'
    }];
  }

  try {
    let prompt = '';
    
    switch(type) {
      case 'grammar':
        prompt = `Review this text for grammar and style improvements. Provide 2-3 specific suggestions:\n\n"${content}"\n\nProvide suggestions in a concise, actionable format.`;
        break;
      case 'improve':
        prompt = `Suggest ways to improve the clarity and impact of this text:\n\n"${content}"\n\nProvide 2-3 specific improvements.`;
        break;
      case 'continue':
        prompt = `Continue writing in the same style and tone:\n\n"${content}"\n\nWrite 1-2 sentences that naturally continue from this text.`;
        break;
      case 'rephrase':
        prompt = `Provide 2 alternative ways to express this idea:\n\n"${content}"`;
        break;
      case 'format-apa':
        prompt = `Review this text for APA formatting compliance. Check for:\n1. Proper in-text citations (Author, Year)\n2. Paragraph structure and indentation\n3. Reference formatting\n4. Heading levels\n\nText: "${content}"\n\nProvide specific formatting corrections needed.`;
        break;
      case 'format-mla':
        prompt = `Review this text for MLA formatting compliance. Check for:\n1. Proper in-text citations (Author Page)\n2. Paragraph structure\n3. Works Cited formatting\n4. Quote integration\n\nText: "${content}"\n\nProvide specific formatting corrections needed.`;
        break;
      case 'citations':
        prompt = `Help improve the citations in this text. Identify:\n1. Missing citations\n2. Improperly formatted citations\n3. Sources that need page numbers\n\nText: "${content}"\n\nProvide citation improvement suggestions.`;
        break;
      default:
        prompt = `Provide helpful writing suggestions for this text:\n\n"${content}"`;
    }

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful writing assistant for a book editor. Provide concise, actionable suggestions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const suggestions = response.choices[0].message.content
      .split('\n')
      .filter(s => s.trim())
      .slice(0, 3) // Max 3 suggestions
      .map((text, index) => ({
        id: Date.now() + index,
        type: type,
        text: text.replace(/^\d+\.\s*/, '').trim() // Remove numbering if present
      }));

    return suggestions.length > 0 ? suggestions : [{
      id: Date.now(),
      type: type,
      text: 'No suggestions available for this content.'
    }];

  } catch (error) {
    console.error('AI Service Error:', error);
    return [{
      id: Date.now(),
      type: 'error',
      text: error.message.includes('401') 
        ? 'Invalid API key. Please check your OpenAI API key in .env.local'
        : 'AI service temporarily unavailable. Please try again.'
    }];
  }
};

export const improveText = async (text) => {
  const client = initializeOpenAI();
  
  if (!client) {
    return text;
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional editor. Improve the text while maintaining the author\'s voice and intent.'
        },
        {
          role: 'user',
          content: `Improve this text:\n\n${text}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI Improvement Error:', error);
    return text;
  }
};

export const suggestParagraphBreaks = async (text) => {
  const client = initializeOpenAI();
  
  if (!client) {
    return { 
      suggestions: [], 
      message: 'AI paragraph analysis not available - API key not configured' 
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a professional editor analyzing paragraph structure for ANY type of writing. Break up large text blocks into well-structured paragraphs as a skilled writer would organize them.

          CRITICAL RULES:
          1. NEVER change, rewrite, or modify any words
          2. ONLY suggest where to INSERT paragraph breaks (\\n\\n)
          3. Adapt to the writing style (fiction, memoir, business, academic, etc.)
          4. Look for natural flow breaks and reader comprehension points
          5. Typical paragraphs: 2-6 sentences, but adapt to content type
          6. Each paragraph should have a clear focus or purpose

          For ANY writing type, analyze for these break points:
          - Topic shifts or new ideas introduced
          - Scene changes or time shifts (fiction/memoir)
          - Dialogue transitions (new speaker)
          - Emotional or mood changes  
          - Cause and effect relationships
          - Examples or illustrations following explanations
          - Contrasting ideas or perspectives
          - Action sequences vs. description
          - Problem/solution transitions
          - Character or perspective changes
          - Temporal sequences (then, next, meanwhile)

          Return ONLY a JSON object:
          {
            "breaks": [
              {"position": 123, "reason": "Scene shifts to new location"},
              {"position": 456, "reason": "New character introduced"},
              {"position": 789, "reason": "Topic changes from X to Y"}
            ]
          }
          Position = exact character index where \\n\\n should be inserted.`
        },
        {
          role: 'user',
          content: `Break this text into natural paragraphs. Adapt your analysis to the writing style and content type:\n\n${text.slice(0, 2000)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    try {
      const result = JSON.parse(response.choices[0].message.content);
      return {
        suggestions: result.breaks || [],
        message: `Found ${result.breaks?.length || 0} potential paragraph break points`
      };
    } catch (parseError) {
      return {
        suggestions: [],
        message: 'Could not parse paragraph suggestions'
      };
    }

  } catch (error) {
    console.error('Paragraph Analysis Error:', error);
    return {
      suggestions: [],
      message: 'Error analyzing paragraph structure'
    };
  }
};

export const applyParagraphBreaks = (text, breaks) => {
  // Sort breaks by position (descending) so we don't mess up positions when inserting
  const sortedBreaks = breaks.sort((a, b) => b.position - a.position);
  
  let newText = text;
  sortedBreaks.forEach(breakPoint => {
    if (breakPoint.position > 0 && breakPoint.position < newText.length) {
      // Insert paragraph break (double newline) at specified position
      newText = newText.slice(0, breakPoint.position) + '\n\n' + newText.slice(breakPoint.position);
    }
  });
  
  return newText;
};