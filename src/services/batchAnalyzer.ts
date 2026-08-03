import { Chess } from 'chess.js';
import { Engine } from './engine';
import { ChessGame } from './chessApi';

export interface Mistake {
  moveNumber: number;
  gamePhase: 'Opening' | 'Middlegame' | 'Endgame';
  evalDrop: number;
  type: 'Mistake' | 'Blunder';
  pieceMoved: string;
  fen: string;
}

export interface AnalysisReport {
  totalGames: number;
  totalMovesAnalyzed: number;
  totalMistakes: number;
  totalBlunders: number;
  phaseMistakes: {
    Opening: number;
    Middlegame: number;
    Endgame: number;
  };
  mistakes: Mistake[];
}

const getGamePhase = (moveNumber: number) => {
  if (moveNumber <= 12) return 'Opening';
  if (moveNumber <= 35) return 'Middlegame';
  return 'Endgame';
};

export async function analyzeGames(
  games: ChessGame[], 
  username: string, 
  engine: Engine,
  onProgress: (progress: number) => void
): Promise<AnalysisReport> {
  const report: AnalysisReport = {
    totalGames: games.length,
    totalMovesAnalyzed: 0,
    totalMistakes: 0,
    totalBlunders: 0,
    phaseMistakes: { Opening: 0, Middlegame: 0, Endgame: 0 },
    mistakes: []
  };

  for (let i = 0; i < games.length; i++) {
    const pgn = games[i].pgn;
    const isWhite = games[i].white.username.toLowerCase() === username.toLowerCase();
    
    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
    } catch (e) {
      continue; // Skip invalid games
    }

    const history = chess.history({ verbose: true });
    
    // We recreate the game move by move to evaluate
    const evalGame = new Chess();
    let prevEval = 0.2; // Start with standard opening advantage for white
    
    // We only analyze up to 40 moves per game to prevent taking forever in the browser
    const movesToAnalyze = Math.min(history.length, 80); // 40 full moves

    for (let j = 0; j < movesToAnalyze; j++) {
      const move = history[j];
      evalGame.move(move);
      
      const isUserTurn = isWhite ? move.color === 'w' : move.color === 'b';
      
      // Fast evaluation at depth 8
      const currentEval = await engine.evaluatePositionAsync(evalGame.fen(), 8);
      
      if (isUserTurn && j > 0) {
        report.totalMovesAnalyzed++;
        
        // Calculate the drop. If I'm white, I want positive eval. If black, negative eval.
        const advantageDrop = isWhite ? (prevEval - currentEval) : (currentEval - prevEval);
        
        if (advantageDrop >= 1.0) {
          const type = advantageDrop >= 2.0 ? 'Blunder' : 'Mistake';
          const fullMoveNumber = Math.floor(j / 2) + 1;
          const phase = getGamePhase(fullMoveNumber);
          
          if (type === 'Blunder') report.totalBlunders++;
          else report.totalMistakes++;
          
          report.phaseMistakes[phase]++;
          
          report.mistakes.push({
            moveNumber: fullMoveNumber,
            gamePhase: phase,
            evalDrop: advantageDrop,
            type,
            pieceMoved: move.piece,
            fen: evalGame.fen()
          });
        }
      }
      
      prevEval = currentEval;
      
      // Update progress
      const totalMovesAcrossAllGames = games.length * 40; // rough estimate
      const currentOverallMove = (i * 40) + Math.floor(j/2);
      onProgress(Math.min(99, Math.floor((currentOverallMove / totalMovesAcrossAllGames) * 100)));
    }
  }

  onProgress(100);
  return report;
}
