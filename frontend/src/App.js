import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import StandingsTable from "./components/StandingsTable";
import MatchSimulator from "./components/MatchSimulator";
import ChampionCelebration from "./components/ChampionCelebration";
import TopScorers from "./components/TopScorers";

const API_URL = "http://localhost:3001/api";

function App() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [champion, setChampion] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedChampions, setCelebratedChampions] = useState([]);
  const [showScorers, setShowScorers] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    fetchStandings();
    applyTheme();
  }, []);

  useEffect(() => {
    if (standings.length > 0) {
      checkChampion(standings);
    }
  }, [standings]);

  const applyTheme = () => {
    if (isDarkTheme) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    setTimeout(() => applyTheme(), 0);
  };

  const fetchStandings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/standings`);
      setStandings(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro:", err);
      setError("Não foi possível carregar a classificação");
    } finally {
      setLoading(false);
    }
  };

  const checkChampion = (standingsData) => {
    if (standingsData.length < 2) return;

    const first = standingsData[0];
    const second = standingsData[1];
    const remainingRounds = 38 - first.matchesPlayed;
    const maxPointsPossible = remainingRounds * 3;
    const currentAdvantage = first.points - second.points;
    const isMathChampion = currentAdvantage > maxPointsPossible;
    const isLateSeason =
      first.matchesPlayed >= 35 && first.points > second.points + 10;

    if (
      (isMathChampion || isLateSeason) &&
      !celebratedChampions.includes(first.team)
    ) {
      setChampion(first.team);
      setShowCelebration(true);
      setCelebratedChampions([...celebratedChampions, first.team]);
    }
  };

  const initializeDatabase = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/initialize`);
      await fetchStandings();
      setCelebratedChampions([]);
      alert("🏆 Campeonato reiniciado com sucesso!");
    } catch (err) {
      alert("❌ Erro ao reiniciar");
    } finally {
      setLoading(false);
    }
  };

  if (loading && standings.length === 0) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Carregando campeonato...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {showCelebration && champion && (
        <ChampionCelebration
          champion={champion}
          onClose={() => setShowCelebration(false)}
        />
      )}

      {showScorers && <TopScorers onClose={() => setShowScorers(false)} />}

      <header className="App-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">🏆</span>
            <span className="logo-text">Brasileirão</span>
            <span className="logo-year">2025</span>
          </div>

          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowScorers(true)}
            >
              ⚽ Artilheiros
            </button>
            <button className="btn btn-primary" onClick={initializeDatabase}>
              🔄 Reiniciar
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkTheme ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main>
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button className="btn btn-outline" onClick={fetchStandings}>
              Tentar novamente
            </button>
          </div>
        )}

        <StandingsTable standings={standings} />
        <MatchSimulator onMatchSimulated={fetchStandings} />
      </main>
    </div>
  );
}

export default App;
