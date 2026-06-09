import { FolderOpen } from 'lucide-react';

export function SectionNavigator({ sections, counts, activeSection, total, onSelect }) {
  return (
    <div className="section-module">
      <div className="module-heading">
        <div>
          <h3>Carpetas principales</h3>
          <p>Navega igual que en tu Drive, pero limpio para estudiar.</p>
        </div>
      </div>
      <div className="section-tabs">
        <button className={!activeSection ? 'active' : ''} onClick={() => onSelect('')}>
          <FolderOpen size={16} />
          Todo <span>{total}</span>
        </button>
        {sections.map((section) => (
          <button key={section} className={activeSection === section ? 'active' : ''} onClick={() => onSelect(section)}>
            <FolderOpen size={16} />
            {section} <span>{counts[section] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
