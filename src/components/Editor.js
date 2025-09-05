import React, { useState, useEffect } from 'react';
import { Bold, Italic, List, Link, Image, Quote } from 'lucide-react';

function Editor({ chapter, onUpdateChapter, aiSuggestions, onUpdateSuggestions }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title);
      setContent(chapter.content);
    }
  }, [chapter]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (chapter) {
      onUpdateChapter(chapter.id, { title: newTitle });
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (chapter) {
      onUpdateChapter(chapter.id, { content: newContent });
    }
  };

  const insertFormatting = (type) => {
    const textarea = document.getElementById('content-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = '';

    switch(type) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'quote':
        newText = `> ${selectedText}`;
        break;
      case 'list':
        newText = `- ${selectedText}`;
        break;
      default:
        newText = selectedText;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    if (chapter) {
      onUpdateChapter(chapter.id, { content: newContent });
    }
  };

  const applySuggestion = (suggestion) => {
    // This is where AI content suggestions would be applied
    // For now, just show that it's not implemented
    console.log('Apply suggestion:', suggestion);
    // In the future, this could apply specific text changes suggested by AI
    alert('Apply suggestion functionality not yet implemented. This would apply AI-suggested content changes.');
  };

  const dismissSuggestion = (suggestionId) => {
    if (onUpdateSuggestions) {
      const updatedSuggestions = aiSuggestions.filter(s => s.id !== suggestionId);
      onUpdateSuggestions(updatedSuggestions);
    }
  };

  if (!chapter) {
    return <div className="editor">No chapter selected</div>;
  }

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <button onClick={() => insertFormatting('bold')} title="Bold">
          <Bold size={18} />
        </button>
        <button onClick={() => insertFormatting('italic')} title="Italic">
          <Italic size={18} />
        </button>
        <button onClick={() => insertFormatting('quote')} title="Quote">
          <Quote size={18} />
        </button>
        <button onClick={() => insertFormatting('list')} title="List">
          <List size={18} />
        </button>
        <div className="toolbar-separator"></div>
        <button title="Insert Link">
          <Link size={18} />
        </button>
        <button title="Insert Image">
          <Image size={18} />
        </button>
      </div>
      
      <input 
        type="text"
        className="chapter-title-input"
        value={title}
        onChange={handleTitleChange}
        placeholder="Chapter Title..."
      />
      
      <div className="editor-content">
        <textarea
          id="content-editor"
          className="content-textarea"
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing your chapter..."
        />
        
        {aiSuggestions.length > 0 && (
          <div className="ai-suggestions">
            <h3>AI Suggestions</h3>
            {aiSuggestions.map(suggestion => (
              <div key={suggestion.id} className="suggestion-item">
                <span className="suggestion-type">{suggestion.type}</span>
                <p>{suggestion.text}</p>
                {suggestion.type !== 'loading' && suggestion.type !== 'success' && suggestion.type !== 'error' && (
                  <div className="suggestion-actions">
                    <button 
                      className="apply-suggestion-btn"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      Apply
                    </button>
                    <button 
                      className="dismiss-suggestion-btn"
                      onClick={() => dismissSuggestion(suggestion.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="editor-footer">
        <span className="word-count">
          Words: {content.split(/\s+/).filter(word => word.length > 0).length}
        </span>
        <span className="char-count">
          Characters: {content.length}
        </span>
      </div>
    </div>
  );
}

export default Editor;