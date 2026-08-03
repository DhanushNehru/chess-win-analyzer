export class Engine {
  private stockfish: Worker | null = null;
  private isReady = false;
  private evaluationCallback: ((evalObj: any) => void) | null = null;
  private bestMoveCallback: ((move: string) => void) | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Create worker from public folder
    this.stockfish = new Worker('/stockfish.js');
    
    this.stockfish.onmessage = (event) => {
      const line = event.data;
      if (line === 'uciok') {
        this.isReady = true;
      } else if (line.includes('info depth')) {
        this.parseEvaluation(line);
      } else if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1];
        if (this.bestMoveCallback) this.bestMoveCallback(move);
      }
    };

    this.stockfish.postMessage('uci');
  }

  private parseEvaluation(line: string) {
    if (!this.evaluationCallback) return;
    
    // Simple parsing for demonstration
    const matchScore = line.match(/score cp (-?\d+)/);
    const matchMate = line.match(/score mate (-?\d+)/);
    
    if (matchMate) {
      this.evaluationCallback({ type: 'mate', value: parseInt(matchMate[1], 10) });
    } else if (matchScore) {
      // Convert centipawns to standard pawn advantage (e.g. 50 -> 0.5)
      this.evaluationCallback({ type: 'cp', value: parseInt(matchScore[1], 10) / 100 });
    }
  }

  evaluatePosition(fen: string, depth = 12) {
    if (!this.stockfish || !this.isReady) return;
    this.stockfish.postMessage('stop');
    this.stockfish.postMessage(`position fen ${fen}`);
    this.stockfish.postMessage(`go depth ${depth}`);
  }

  onEvaluation(callback: (evalObj: any) => void) {
    this.evaluationCallback = callback;
  }

  onBestMove(callback: (move: string) => void) {
    this.bestMoveCallback = callback;
  }

  destroy() {
    if (this.stockfish) {
      this.stockfish.terminate();
    }
  }
}
