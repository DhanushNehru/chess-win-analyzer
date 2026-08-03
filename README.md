# Grandmaster Vision

An open-source chess analysis tool that takes your Chess.com username and gives free recommendations on improving your chess. All for free and more to come, but for now limited.

## Features

- **Chess.com Integration**: Instantly fetches your latest games from Chess.com.
- **Stockfish Engine Analysis**: Evaluates your positions completely locally in your browser using the Stockfish WebAssembly engine.
- **Manual Game Input**: Paste any PGN or standard algebraic move list for offline analysis.
- **Beautiful UI**: Modern glassmorphism dark-theme design.

## Getting Started

To run this project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/chess-win-analyzer.git
   cd chess-win-analyzer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173/` and start analyzing!

## Technologies Used

- **React & Vite**: Fast frontend framework and build tool.
- **Stockfish.js**: WebAssembly port of the world's strongest open-source chess engine.
- **Chess.js**: Move generation, validation, and PGN parsing.
- **React-Chessboard**: A beautiful, interactive chessboard component.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
