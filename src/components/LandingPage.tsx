import { useState } from 'react';
import { Search, PenLine } from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onStart: (data: { username?: string; pgnInput?: string }) => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [activeTab, setActiveTab] = {
    view: useState<'chesscom' | 'pgn'>('chesscom')
  }.view;
  
  const [username, setUsername] = useState('');
  const [pgn, setPgn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'chesscom' && username.trim()) {
      onStart({ username: username.trim() });
    } else if (activeTab === 'pgn' && pgn.trim()) {
      onStart({ pgnInput: pgn.trim() });
    }
  };

  return (
    <div className="landing-container animate-fade-in">
      <div className="landing-content glass-panel">
        <div className="landing-header">
          <h1 className="gradient-text">Grandmaster Vision</h1>
          <p>
            An open-source tool that analyzes your Chess.com games and gives free recommendations on improving your chess. 
            All for free and more to come, but for now limited.
          </p>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'chesscom' ? 'active' : ''}`}
            onClick={() => setActiveTab('chesscom')}
          >
            <Search size={18} />
            Chess.com Username
          </button>
          <button 
            className={`tab ${activeTab === 'pgn' ? 'active' : ''}`}
            onClick={() => setActiveTab('pgn')}
          >
            <PenLine size={18} />
            Paste PGN / Moves
          </button>
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          {activeTab === 'chesscom' ? (
            <div className="input-group animate-fade-in">
              <input
                type="text"
                placeholder="Enter Chess.com username (e.g., hikaru)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          ) : (
            <div className="input-group animate-fade-in">
              <textarea
                placeholder="Paste PGN or algebraic move list here..."
                value={pgn}
                onChange={(e) => setPgn(e.target.value)}
                rows={6}
                autoFocus
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={activeTab === 'chesscom' ? !username.trim() : !pgn.trim()}
          >
            Start Analyzing
          </button>
        </form>
      </div>
    </div>
  );
}
