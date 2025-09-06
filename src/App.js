import React, { useState } from 'react';
import './App.css';
import Editor from './components/Editor';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { parseMultipleTexFiles } from './utils/latexParser';
import { getAISuggestions, suggestParagraphBreaks } from './services/aiService';
import { formatAPA, formatMLA, analyzeAcademicFormat } from './services/formattingService';

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
      
      // Check if any chapters need paragraph analysis
      const needsParagraphAnalysis = importedChapters.some(ch => 
        ch.content.startsWith('[NEEDS_PARAGRAPH_ANALYSIS]')
      );
      
      if (needsParagraphAnalysis) {
        setTimeout(() => {
          setAiSuggestions([{
            id: Date.now(),
            type: 'info',
            text: 'Imported text appears to have few paragraph breaks. Consider using "AI Assist → Suggest Paragraph Breaks" to improve readability.'
          }]);
        }, 1000);
      }
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

    // Handle paragraph break suggestions
    if (type === 'paragraph-breaks') {
      await handleParagraphBreakSuggestions();
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

  const handleParagraphBreakSuggestions = async () => {
    setAiSuggestions([{
      id: Date.now(),
      type: 'loading',
      text: 'Analyzing paragraph structure...'
    }]);

    let content = activeChapter.content;
    
    // Remove the analysis marker if it exists
    if (content.startsWith('[NEEDS_PARAGRAPH_ANALYSIS]\n')) {
      content = content.replace('[NEEDS_PARAGRAPH_ANALYSIS]\n', '');
    }

    const result = await suggestParagraphBreaks(content);
    
    if (result.suggestions.length > 0) {
      // Create actionable suggestions for paragraph breaks
      const suggestions = result.suggestions.map((breakPoint, index) => ({
        id: Date.now() + index,
        type: 'paragraph-break',
        text: `Insert paragraph break: ${breakPoint.reason}`,
        action: 'paragraph-break',
        data: { position: breakPoint.position, reason: breakPoint.reason }
      }));

      setAiSuggestions(suggestions);
    } else {
      setAiSuggestions([{
        id: Date.now(),
        type: 'info',
        text: result.message || 'No paragraph break suggestions found.'
      }]);
    }
  };

  const applyFormatting = async (type) => {
    if (!activeChapter || !activeChapter.content) return;

    setAiSuggestions([{
      id: Date.now(),
      type: 'loading',
      text: 'Applying structural formatting...'
    }]);

    const style = type.includes('apa') ? 'APA' : 'MLA';

    try {
      // ONLY use strict parser-based formatting - NO AI content editing
      let formattedContent;
      if (style === 'APA') {
        formattedContent = formatAPA(activeChapter.content);
      } else {
        formattedContent = formatMLA(activeChapter.content);
      }

      // Update the chapter content with ONLY structural changes
      updateChapter(activeChapter.id, { content: formattedContent });

      // Analyze what was changed
      const analysis = analyzeAcademicFormat(activeChapter.content, style);
      const changesText = analysis.issues.length > 0 
        ? `Applied ${style} formatting: ${analysis.issues.length} structural issues fixed`
        : `${style} formatting applied - document structure updated`;

      setAiSuggestions([{
        id: Date.now(),
        type: 'success',
        text: changesText
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
          onUpdateSuggestions={setAiSuggestions}
        />
      </div>
    </div>
  );
}

export default App;