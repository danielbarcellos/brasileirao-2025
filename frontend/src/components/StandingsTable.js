import React from 'react';
import './StandingsTable.css';

const StandingsTable = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="standings-container">
        <h2>📊 Classificação</h2>
        <p>Nenhum dado disponível. Clique em "Reiniciar Campeonato" para começar.</p>
      </div>
    );
  }

  return (
    <div className="standings-container">
      <h2>📊 Classificação</h2>
      <div className="table-responsive">
        <table className="standings-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Time</th>
              <th>PJ</th>
              <th>VIT</th>
              <th>E</th>
              <th>DER</th>
              <th>GM</th>
              <th>GC</th>
              <th>SG</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr key={team.team} className={
                index === 0 ? 'champion' :
                index < 4 ? 'libertadores' : 
                index < 6 ? 'pre-libertadores' : 
                index > 16 ? 'relegation' : ''
              }>
                <td className="position">
                  {index === 0 && '🏆'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && (index + 1)}
                </td>
                <td className="team-name">{team.team}</td>
                <td>{team.matchesPlayed}</td>
                <td>{team.wins}</td>
                <td>{team.draws}</td>
                <td>{team.losses}</td>
                <td>{team.goalsFor}</td>
                <td>{team.goalsAgainst}</td>
                <td className={team.goalDifference >= 0 ? 'positive-sg' : 'negative-sg'}>
                  {team.goalDifference}
                </td>
                <td className="points">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color champion-color"></div>
          <span>Campeão</span>
        </div>
        <div className="legend-item">
          <div className="legend-color libertadores-color"></div>
          <span>Libertadores (G4)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color pre-libertadores-color"></div>
          <span>Pré-Libertadores</span>
        </div>
        <div className="legend-item">
          <div className="legend-color relegation-color"></div>
          <span>Zona de Rebaixamento</span>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;