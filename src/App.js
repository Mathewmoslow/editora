import React, { useState } from 'react';
import './App.css';
import Editor from './components/Editor';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { parseLatexToChapters, parseMultipleTexFiles } from './utils/latexParser';
import { getAISuggestions, formatTextWithAI } from './services/aiService';
import { formatAPA, formatMLA } from './services/formattingService';

function App() {
  const [chapters, setChapters] = useState([
    { id: 1, title: 'Introduction', content: 'Welcome to your book...' }
  ]);
  const [activeChapterId, setActiveChapterId] = useState(1);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const activeChapter = chapters.find(ch => ch.id === activeChapterId);

  const addChapter = () => {
    const newChapter = {
      id: Date.now(),
      title: `Chapter ${chapters.length + 1}`,
      content: ''
    };
    setChapters([...chapters, newChapter]);
    setActiveChapterId(newChapter.id);
  };

  const updateChapter = (id, updates) => {
    setChapters(chapters.map(ch => 
      ch.id === id ? { ...ch, ...updates } : ch
    ));
  };

  const deleteChapter = (id) => {
    if (chapters.length > 1) {
      const newChapters = chapters.filter(ch => ch.id !== id);
      setChapters(newChapters);
      if (id === activeChapterId) {
        setActiveChapterId(newChapters[0].id);
      }
    }
  };

  const handleImportFiles = async (files) => {
    const fileContents = [];
    
    for (let file of files) {
      const content = await file.text();
      fileContents.push({
        name: file.name,
        content: content
      });
    }
    
    const importedChapters = parseMultipleTexFiles(fileContents);
    
    if (importedChapters.length > 0) {
      // Replace existing chapters with imported ones
      setChapters(importedChapters);
      setActiveChapterId(importedChapters[0].id);
    }
  };

  const generateAISuggestion = async (type = 'improve') => {
    if (!activeChapter || !activeChapter.content) {
      setAiSuggestions([{
        id: Date.now(),
        type: 'info',
        text: 'Please add some content to get AI suggestions.'
      }]);
      return;
    }

    // Handle formatting actions differently
    if (type.startsWith('apply-')) {
      await applyFormatting(type);
      return;
    }

    // Get selected text or use current paragraph
    const selection = window.getSelection().toString();
    const textToAnalyze = selection || activeChapter.content.slice(0, 500);
    
    setAiSuggestions([{
      id: Date.now(),
      type: 'loading',
      text: 'Getting AI suggestions...'
    }]);

    const suggestions = await getAISuggestions(textToAnalyze, type);
    setAiSuggestions(suggestions);
  };

  const applyFormatting = async (type) => {
    if (!activeChapter || !activeChapter.content) return;

    setAiSuggestions([{
      id: Date.now(),
      type: 'loading',
      text: 'Applying formatting...'
    }]);

    let formattedContent = activeChapter.content;
    const style = type.includes('apa') ? 'APA' : 'MLA';

    try {
      // Try AI formatting first
      if (process.env.REACT_APP_OPENAI_API_KEY) {
        formattedContent = await formatTextWithAI(activeChapter.content, style);
      } else {
        // Fall back to local formatting
        if (style === 'APA') {
          formattedContent = formatAPA(activeChapter.content);
        } else {
          formattedContent = formatMLA(activeChapter.content);
        }
      }

      // Update the chapter content
      updateChapter(activeChapter.id, { content: formattedContent });

      setAiSuggestions([{
        id: Date.now(),
        type: 'success',
        text: `Successfully applied ${style} formatting to the chapter.`
      }]);

    } catch (error) {
      setAiSuggestions([{
        id: Date.now(),
        type: 'error',
        text: `Error applying formatting: ${error.message}`
      }]);
    }
  };

  return (
    <div className="App">
      <Header 
        onAIAssist={generateAISuggestion}
        onImport={handleImportFiles}
      />
      <div className="main-content">
        <Sidebar 
          chapters={chapters}
          activeChapterId={activeChapterId}
          onChapterSelect={setActiveChapterId}
          onAddChapter={addChapter}
          onDeleteChapter={deleteChapter}
        />
        <Editor 
          chapter={activeChapter}
          onUpdateChapter={updateChapter}
          aiSuggestions={aiSuggestions}
        />
      </div>
    </div>
  );
}

export default App;