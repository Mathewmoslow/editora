import React, { useRef, useState } from 'react';
import { BookOpen, Wand2, Save, Download, Settings, Upload, ChevronDown } from 'lucide-react';

function Header({ onAIAssist, onImport }) {
  const fileInputRef = useRef(null);
  const [showAIMenu, setShowAIMenu] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onImport(files);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleAIClick = (type) => {
    onAIAssist(type);
    setShowAIMenu(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <BookOpen className="logo-icon" />
        <h1>Editoria AI</h1>
      </div>
      <div className="header-center">
        <button className="header-btn" onClick={handleImportClick}>
          <Upload size={18} />
          Import .tex
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".tex"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="ai-dropdown">
          <button 
            className="header-btn" 
            onClick={() => setShowAIMenu(!showAIMenu)}
          >
            <Wand2 size={18} />
            AI Assist
            <ChevronDown size={14} />
          </button>
          {showAIMenu && (
            <div className="ai-menu">
              <button onClick={() => handleAIClick('improve')}>Improve Writing</button>
              <button onClick={() => handleAIClick('grammar')}>Check Grammar</button>
              <button onClick={() => handleAIClick('continue')}>Continue Writing</button>
              <button onClick={() => handleAIClick('rephrase')}>Rephrase</button>
              <div className="menu-separator"></div>
              <button onClick={() => handleAIClick('paragraph-breaks')}>Suggest Paragraph Breaks</button>
              <button onClick={() => handleAIClick('format-apa')}>Format APA Style</button>
              <button onClick={() => handleAIClick('format-mla')}>Format MLA Style</button>
              <button onClick={() => handleAIClick('citations')}>Check Citations</button>
              <div className="menu-separator"></div>
              <button onClick={() => handleAIClick('apply-apa')}>Apply APA Formatting</button>
              <button onClick={() => handleAIClick('apply-mla')}>Apply MLA Formatting</button>
            </div>
          )}
        </div>
        <button className="header-btn">
          <Save size={18} />
          Save
        </button>
        <button className="header-btn">
          <Download size={18} />
          Export
        </button>
      </div>
      <div className="header-right">
        <button className="header-btn icon-btn">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}

export default Header;