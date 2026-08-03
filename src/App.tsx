import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

export type AppState = {
  view: 'landing' | 'dashboard';
  username?: string;
  pgnInput?: string;
};

function App() {
  const [appState, setAppState] = useState<AppState>({ view: 'landing' });

  return (
    <div className="app-container">
      {appState.view === 'landing' ? (
        <LandingPage onStart={(data) => setAppState({ view: 'dashboard', ...data })} />
      ) : (
        <Dashboard 
          username={appState.username} 
          pgnInput={appState.pgnInput}
          onBack={() => setAppState({ view: 'landing' })}
        />
      )}
    </div>
  );
}

export default App;
