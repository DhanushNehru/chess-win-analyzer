import { useState } from 'react';
import { AnalysisReport, analyzeGames } from '../services/batchAnalyzer';
import { ChessGame } from '../services/chessApi';
import { Engine } from '../services/engine';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './InsightsPanel.css';

interface InsightsPanelProps {
  games: ChessGame[];
  username: string;
  engine: Engine | null;
}

export default function InsightsPanel({ games, username, engine }: InsightsPanelProps) {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startAnalysis = async () => {
    if (!engine) return;
    setAnalyzing(true);
    setProgress(0);
    
    try {
      const result = await analyzeGames(games, username, engine, (p) => setProgress(p));
      setReport(result);
    } catch (e) {
      console.error(e);
      alert("Failed to analyze games.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!report && !analyzing) {
    return (
      <div className="insights-cta">
        <Activity size={48} className="cta-icon" />
        <p>Find your hidden weaknesses across {games.length} recent games.</p>
        <button className="start-btn" onClick={startAnalysis}>Generate Insights</button>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="insights-loading">
        <Activity size={48} className="spinner" />
        <p>Analyzing {games.length} games move-by-move...</p>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-text">{progress}%</span>
      </div>
    );
  }

  if (report) {
    const phases = report.phaseMistakes;
    let weakestPhase = 'Opening';
    let max = phases.Opening;
    if (phases.Middlegame > max) { weakestPhase = 'Middlegame'; max = phases.Middlegame; }
    if (phases.Endgame > max) { weakestPhase = 'Endgame'; max = phases.Endgame; }

    return (
      <div className="insights-report animate-fade-in">
        <div className="report-header">
          <CheckCircle2 size={32} className="success-icon" />
          <h3>Analysis Complete</h3>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Moves Analyzed</span>
            <span className="stat-value">{report.totalMovesAnalyzed}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Mistakes</span>
            <span className="stat-value text-warning">{report.totalMistakes}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Blunders</span>
            <span className="stat-value text-danger">{report.totalBlunders}</span>
          </div>
        </div>

        <div className="weakness-card glass-panel">
          <div className="weakness-header">
            <AlertTriangle size={24} className="text-warning" />
            <h4>Your Weakest Phase: {weakestPhase}</h4>
          </div>
          <p className="weakness-desc">
            You made {max} significant mistakes in the {weakestPhase.toLowerCase()}. 
            Focus your training on {weakestPhase.toLowerCase()} principles and tactics to improve your win rate.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
