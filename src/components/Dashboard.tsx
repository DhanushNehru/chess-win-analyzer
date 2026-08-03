import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ArrowLeft, Loader2, ChevronLeft, RotateCcw, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { fetchRecentGames, ChessGame } from '../services/chessApi';
import { Engine } from '../services/engine';
import GameList from './GameList';
import InsightsPanel from './InsightsPanel';
import './Dashboard.css';

interface DashboardProps {
  username?: string;
  pgnInput?: string;
  onBack: () => void;
}

export default function Dashboard({ username, pgnInput, onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'live' | 'insights'>('live');
  const [game, setGame] = useState(new Chess());
  const [gamesList, setGamesList] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [evalScore, setEvalScore] = useState<string>('0.00');
  const [bestMove, setBestMove] = useState<string>('');
  
  const engineRef = useRef<Engine | null>(null);
  
  // Initialize Engine
  useEffect(() => {
    engineRef.current = new Engine();
    
    engineRef.current.onEvaluation((ev) => {
      if (ev.type === 'mate') {
        setEvalScore(`M${ev.value}`);
      } else {
        setEvalScore(ev.value > 0 ? `+${ev.value.toFixed(2)}` : ev.value.toFixed(2));
      }
    });

    engineRef.current.onBestMove((move) => {
      setBestMove(move);
    });

    return () => {
      engineRef.current?.destroy();
    };
  }, []);

  // Fetch games if username is provided
  useEffect(() => {
    if (username) {
      setLoading(true);
      fetchRecentGames(username)
        .then(games => {
          setGamesList(games);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else if (pgnInput) {
      loadGame(pgnInput);
    }
  }, [username, pgnInput]);

  const loadGame = (pgn: string) => {
    try {
      const newGame = new Chess();
      newGame.loadPgn(pgn);
      setGame(newGame);
      engineRef.current?.evaluatePosition(newGame.fen());
    } catch (e) {
      console.error("Invalid PGN");
      alert("Failed to parse game moves. Please check the format.");
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    };

    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move(move);
      
      if (result) {
        setGame(newGame);
        engineRef.current?.evaluatePosition(newGame.fen());
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  const undoMove = () => {
    const newGame = new Chess(game.fen());
    newGame.undo();
    setGame(newGame);
    engineRef.current?.evaluatePosition(newGame.fen());
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header glass-panel">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h2 className="header-title">
          {username ? `Analyzing Games for ${username}` : 'Custom Game Analysis'}
        </h2>
        
        {username && (
          <div className="dashboard-tabs">
            <button 
              className={`dashboard-tab ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => setActiveTab('live')}
            >
              <LayoutDashboard size={18} /> Live Analysis
            </button>
            <button 
              className={`dashboard-tab ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              <BrainCircuit size={18} /> Aggregate Insights
            </button>
          </div>
        )}
      </header>

      {activeTab === 'insights' && username ? (
        <div className="insights-wrapper glass-panel">
          <InsightsPanel games={gamesList} username={username} engine={engineRef.current} />
        </div>
      ) : (
        <div className="dashboard-layout">
          <main className="board-section glass-panel">
            <div className="board-wrapper">
              <Chessboard 
                position={game.fen()} 
                onPieceDrop={onDrop}
                customDarkSquareStyle={{ backgroundColor: '#779556' }}
                customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
                animationDuration={200}
              />
            </div>
            
            <div className="controls glass-panel">
              <button className="control-btn" onClick={undoMove}>
                <ChevronLeft size={20} /> Prev Move
              </button>
              <button className="control-btn" onClick={() => {
                const newGame = new Chess();
                setGame(newGame);
                engineRef.current?.evaluatePosition(newGame.fen());
              }}>
                <RotateCcw size={20} /> Reset
              </button>
            </div>
          </main>

          <aside className="analysis-section glass-panel">
            <h3>Engine Evaluation</h3>
            <div className="eval-box">
              <div className="eval-score gradient-text">{evalScore}</div>
              {bestMove && (
                <div className="best-move">
                  Top Engine Move: <strong>{bestMove}</strong>
                </div>
              )}
            </div>
            
            {username && gamesList.length > 0 && (
              <div className="games-container">
                <h3>Recent Games</h3>
                <GameList games={gamesList} username={username} onSelectGame={loadGame} />
              </div>
            )}
            
            {loading && (
              <div className="loader-container">
                <Loader2 className="spinner" size={32} />
                <p>Fetching games...</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
