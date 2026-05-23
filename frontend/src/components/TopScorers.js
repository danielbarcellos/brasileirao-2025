import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TopScorers.css";

const API_URL = "http://localhost:3001/api";

const TopScorers = ({ onClose }) => {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");

  useEffect(() => {
    fetchScorers();
  }, []);

  const fetchScorers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/scorers`);
      console.log("Artilheiros recebidos:", response.data); // Log para debug
      setScorers(response.data);
    } catch (error) {
      console.error("Erro ao buscar artilheiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case "Atacante":
        return "⚽";
      case "Meia":
        return "🎯";
      default:
        return "🛡️";
    }
  };

  const filteredScorers = () => {
    let filtered = [...scorers];

    if (selectedTeam !== "all") {
      filtered = filtered.filter((s) => s.team === selectedTeam);
    }

    if (filter === "forwards") {
      filtered = filtered.filter((s) => s.position === "Atacante");
    } else if (filter === "midfielders") {
      filtered = filtered.filter((s) => s.position === "Meia");
    }

    // Mostrar apenas quem fez pelo menos 1 gol
    filtered = filtered.filter((s) => s.goals > 0);

    return filtered.sort((a, b) => b.goals - a.goals).slice(0, 20);
  };

  const getTeams = () => {
    const teams = [...new Set(scorers.map((s) => s.team))];
    return teams.sort();
  };

  const totalGoals = scorers.reduce((sum, s) => sum + s.goals, 0);
  const totalPlayers = scorers.filter((s) => s.goals > 0).length;

  if (loading) {
    return (
      <div className="scorers-modal" onClick={onClose}>
        <div className="scorers-content" onClick={(e) => e.stopPropagation()}>
          <div className="scorers-header">
            <h2>⚽ Artilheiros do Campeonato</h2>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="loading-scorers">
            <div className="loader"></div>
            <p>Carregando artilheiros...</p>
          </div>
        </div>
      </div>
    );
  }

  const filtered = filteredScorers();

  return (
    <div className="scorers-modal" onClick={onClose}>
      <div className="scorers-content" onClick={(e) => e.stopPropagation()}>
        <div className="scorers-header">
          <h2>⚽ Artilheiros do Campeonato</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="scorers-stats">
          <div className="stat-card">
            <div className="stat-value">{totalGoals}</div>
            <div className="stat-label">Gols Totais</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalPlayers}</div>
            <div className="stat-label">Jogadores com Gol</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{scorers.length}</div>
            <div className="stat-label">Jogadores Registrados</div>
          </div>
        </div>

        <div className="scorers-filters">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos os Times</option>
            {getTeams().map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>

          <div className="filter-buttons">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              Todos
            </button>
            <button
              className={filter === "forwards" ? "active" : ""}
              onClick={() => setFilter("forwards")}
            >
              ⚽ Atacantes
            </button>
            <button
              className={filter === "midfielders" ? "active" : ""}
              onClick={() => setFilter("midfielders")}
            >
              🎯 Meias
            </button>
          </div>
        </div>

        <div className="scorers-list">
          <div className="scorers-header-row">
            <div className="rank">#</div>
            <div className="player">Jogador</div>
            <div className="team">Time</div>
            <div className="goals">Gols</div>
            <div className="assists">Assist.</div>
            <div className="matches">Jogos</div>
            <div className="average">Média</div>
          </div>

          {filtered.length > 0 ? (
            filtered.map((scorer, index) => (
              <div
                key={scorer.id}
                className={`scorer-row ${index < 3 ? "top-three" : ""}`}
              >
                <div className="rank">
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                  {index > 2 && index + 1}
                </div>
                <div className="player">
                  {getPositionIcon(scorer.position)} {scorer.name}
                  {scorer.penalties > 0 && (
                    <span className="penalties">
                      {" "}
                      ({scorer.penalties} pênaltis)
                    </span>
                  )}
                </div>
                <div className="team">{scorer.team}</div>
                <div className="goals">{scorer.goals}</div>
                <div className="assists">{scorer.assists}</div>
                <div className="matches">{scorer.matches}</div>
                <div className="average">
                  {(scorer.goals / scorer.matches || 0).toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="no-scorers">
              <p>⚽ Nenhum gol registrado ainda!</p>
              <p>Simule algumas rodadas para ver os artilheiros aparecerem.</p>
            </div>
          )}
        </div>

        <div className="scorers-footer">
          <div className="legend">
            <span>⚽ = Atacante</span>
            <span>🎯 = Meia</span>
            <span>🛡️ = Defensor</span>
            <span>🏆 = Top 3 artilheiros</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopScorers;
