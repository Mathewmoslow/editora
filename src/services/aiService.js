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