import { ChessGame } from '../services/chessApi';
import './GameList.css';

interface GameListProps {
  games: ChessGame[];
  username: string;
  onSelectGame: (pgn: string) => void;
}

export default function GameList({ games, username, onSelectGame }: GameListProps) {
  if (games.length === 0) return <p>No recent games found.</p>;

  return (
    <div className="game-list">
      {games.map((game, i) => {
        const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
        const opponent = isWhite ? game.black : game.white;
        const result = isWhite ? game.white.result : game.black.result;
        
        let resultLabel = "Draw";
        if (result === "win") resultLabel = "Won";
        else if (["checkmated", "timeout", "resigned", "lose"].includes(result)) resultLabel = "Lost";

        return (
          <div key={i} className="game-card glass-panel" onClick={() => onSelectGame(game.pgn)}>
            <div className="game-details">
              <span className={`result ${resultLabel.toLowerCase()}`}>{resultLabel}</span>
              <span className="opponent">vs {opponent.username} ({opponent.rating})</span>
            </div>
            <div className="time-control">Time Control: {game.time_control}</div>
          </div>
        );
      })}
    </div>
  );
}
