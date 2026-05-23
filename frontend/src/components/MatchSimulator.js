import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3001/api";

const MatchSimulator = ({ onMatchSimulated }) => {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(1);
  const [matches, setMatches] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [maxRound, setMaxRound] = useState(0);

  useEffect(() => {
    fetchRounds();
  }, []);

  useEffect(() => {
    if (selectedRound) {
      fetchMatches(selectedRound);
    }
  }, [selectedRound]);

  const fetchRounds = async () => {
    try {
      const response = await axios.get(`${API_URL}/matches`);
      if (response.data && response.data.length > 0) {
        const totalRounds = Math.max(...response.data.map((m) => m.round));
        setMaxRound(totalRounds);
        const roundsList = Array.from({ length: totalRounds }, (_, i) => i + 1);
        setRounds(roundsList);
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const fetchMatches = async (round) => {
    try {
      const response = await axios.get(`${API_URL}/matches?round=${round}`);
      setMatches(response.data);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const simulateRound = async () => {
    setSimulating(true);
    try {
      await axios.post(`${API_URL}/matches/simulate`, { round: selectedRound });
      await onMatchSimulated();
      await fetchMatches(selectedRound);
    } catch (error) {
      alert("❌ Erro ao simular rodada");
    } finally {
      setSimulating(false);
    }
  };

  const isRoundSimulated = () => {
    return (
      matches.length > 0 && matches.every((match) => match.played === true)
    );
  };

  const getProgress = () => {
    const simulated = matches.filter((m) => m.played).length;
    return (simulated / matches.length) * 100;
  };

  if (rounds.length === 0) {
    return (
      <div className="simulator-container">
        <div className="simulator-header">
          <h3>🎮 Simulador de Partidas</h3>
        </div>
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          Inicialize o campeonato para começar
        </div>
      </div>
    );
  }

  return (
    <div className="simulator-container">
      <div className="simulator-header">
        <h3>
          <span>🎮</span> Simulador de Partidas
        </h3>

        <div className="round-info">
          <div className="round-selector">
            <label>Rodada</label>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(parseInt(e.target.value))}
              className="round-select"
            >
              {rounds.map((round) => (
                <option key={round} value={round}>
                  {round} / {maxRound}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={simulateRound}
            disabled={simulating || isRoundSimulated()}
            className="simulate-btn"
          >
            {simulating
              ? "🔄 Simulando..."
              : isRoundSimulated()
                ? "✅ Simulado"
                : "🎲 Simular Rodada"}
          </button>
        </div>
      </div>

      <div className="matches-section">
        <h4>📋 Partidas da Rodada {selectedRound}</h4>

        {matches.length > 0 && (
          <div
            style={{
              marginBottom: "16px",
              background: "var(--gray-100)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${getProgress()}%`,
                height: "4px",
                background:
                  "linear-gradient(90deg, var(--primary), var(--primary-light))",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        )}

        <div className="matches-grid">
          {matches.map((match, index) => (
            <div
              key={index}
              className={`match-card ${match.played ? "played" : "pending"}`}
            >
              <div className="match-teams">
                <span className="home-team">{match.homeTeam}</span>
                <span className="vs">VS</span>
                <span className="away-team">{match.awayTeam}</span>
              </div>
              <div
                className={`match-result ${match.played ? "played" : "pending"}`}
              >
                {match.played
                  ? `${match.homeGoals} - ${match.awayGoals}`
                  : "⏳ Aguardando"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchSimulator;
