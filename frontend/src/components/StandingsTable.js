import React from "react";

const StandingsTable = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="standings-container">
        <div className="standings-header">
          <h2>📊 Classificação</h2>
        </div>
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          Nenhum dado disponível. Clique em "Reiniciar" para começar.
        </div>
      </div>
    );
  }

  const getRowClass = (index, team) => {
    if (team === standings[0]?.team) return "row-champion";
    if (index < 4) return "row-libertadores";
    if (index < 6) return "row-pre-libertadores";
    if (index > 15) return "row-relegation";
    return "";
  };

  const getPositionDisplay = (index, team) => {
    if (team === standings[0]?.team) return "🏆";
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return index + 1;
  };

  return (
    <div className="standings-container">
      <div className="standings-header">
        <h2>
          <span>📊</span> Classificação
        </h2>
        <div className="standings-stats">
          <div className="stat-badge">
            <span className="stat-dot libertadores"></span> Libertadores
          </div>
          <div className="stat-badge">
            <span className="stat-dot pre-libertadores"></span> Pré-Libertadores
          </div>
          <div className="stat-badge">
            <span className="stat-dot sul-americana"></span> Sul-Americana
          </div>
          <div className="stat-badge">
            <span className="stat-dot relegation"></span> Zona de Rebaixamento
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="standings-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Time</th>
              <th>PJ</th>
              <th>V</th>
              <th>E</th>
              <th>D</th>
              <th>GP</th>
              <th>GC</th>
              <th>SG</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr key={team.team} className={getRowClass(index, team.team)}>
                <td className="position">
                  {getPositionDisplay(index, team.team)}
                </td>
                <td className="team-name">
                  <span className="team-badge">{team.team.charAt(0)}</span>
                  {team.team}
                </td>
                <td>{team.matchesPlayed}</td>
                <td>{team.wins}</td>
                <td>{team.draws}</td>
                <td>{team.losses}</td>
                <td>{team.goalsFor}</td>
                <td>{team.goalsAgainst}</td>
                <td
                  className={
                    team.goalDifference >= 0 ? "positive-sg" : "negative-sg"
                  }
                >
                  {team.goalDifference}
                </td>
                <td className="points">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsTable;
