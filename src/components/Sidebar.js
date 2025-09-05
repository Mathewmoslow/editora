import React from 'react';
import { Plus, FileText, Trash2 } from 'lucide-react';

function Sidebar({ chapters, activeChapterId, onChapterSelect, onAddChapter, onDeleteChapter }) {
  const handleChapterClick = (e, chapterId) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clicking chapter:', chapterId, 'Active:', activeChapterId);
    console.log('All chapter IDs:', chapters.map(ch => ch.id));
    onChapterSelect(chapterId);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Chapters</h2>
        <button className="add-chapter-btn" onClick={onAddChapter}>
          <Plus size={18} />
        </button>
      </div>
      <div className="chapter-list">
        {chapters.map((chapter, index) => {
          const isActive = String(chapter.id) === String(activeChapterId);
          return (
            <div 
              key={`chapter-${index}`}
              className={`chapter-item${isActive ? ' active' : ''}`}
              onClick={(e) => handleChapterClick(e, chapter.id)}
              data-chapter-id={chapter.id}
              role="button"
              tabIndex={0}
            >
              <FileText size={16} />
              <span className="chapter-title">{chapter.title}</span>
              {chapters.length > 1 && (
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDeleteChapter(chapter.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;