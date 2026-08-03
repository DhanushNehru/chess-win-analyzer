export interface ChessGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  white: { rating: number; result: string; '@id': string; username: string };
  black: { rating: number; result: string; '@id': string; username: string };
}

export async function fetchRecentGames(username: string): Promise<ChessGame[]> {
  try {
    // 1. Fetch archives for the player
    const archivesRes = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
    if (!archivesRes.ok) throw new Error('Player not found or API error');
    
    const archivesData = await archivesRes.json();
    const archives: string[] = archivesData.archives;
    
    if (!archives || archives.length === 0) return [];
    
    // 2. Fetch the most recent month's archive
    const latestArchiveUrl = archives[archives.length - 1];
    const gamesRes = await fetch(latestArchiveUrl);
    if (!gamesRes.ok) throw new Error('Failed to fetch games');
    
    const gamesData = await gamesRes.json();
    const games: ChessGame[] = gamesData.games;
    
    // 3. Return the last 10 games, most recent first
    return games.reverse().slice(0, 10);
  } catch (error) {
    console.error("Error fetching Chess.com games:", error);
    throw error;
  }
}
