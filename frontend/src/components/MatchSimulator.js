import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MatchSimulator.css';

const API_URL = 'http://localhost:3001/api';

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
        const totalRounds = Math.max(...response.data.map(m => m.round));
        setMaxRound(totalRounds);
        const roundsList = Array.from({ length: totalRounds }, (_, i) => i + 1);
        setRounds(roundsList);
      }
    } catch (error) {
      console.error('Erro ao buscar rodadas:', error);
    }
  };

  const fetchMatches = async (round) => {
    try {
      const response = await axios.get(`${API_URL}/matches?round=${round}`);
      setMatches(response.data);
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
    }
  };

  const simulateRound = async () => {
    setSimulating(true);
    try {
      await axios.post(`${API_URL}/matches/simulate`, { round: selectedRound });
      await onMatchSimulated();
      await fetchMatches(selectedRound);
      alert(`✅ Rodada ${selectedRound} simulada com sucesso!`);
    } catch (error) {
      console.error('Erro ao simular:', error);
      alert('❌ Erro ao simular rodada. Verifique se o backend está rodando.');
    } finally {
      setSimulating(false);
    }
  };

  const getMatchStatus = (match) => {
    if (match.played) {
      return `${match.homeGoals} - ${match.awayGoals}`;
    }
    return '⏳ Não jogado';
  };

  const isRoundSimulated = () => {
    return matches.every(match => match.played === true);
  };

  if (rounds.length === 0) {
    return (
      <div className="simulator-container">
        <h3>🎮 Simulador de Partidas</h3>
        <p>Inicialize o campeonato para começar a simular.</p>
      </div>
    );
  }

  return (
    <div className="simulator-container">
      <h3>🎮 Simulador de Partidas</h3>
      
      <div className="simulator-controls">
        <div className="round-selector">
          <label>Selecione a Rodada:</label>
          <select 
            value={selectedRound} 
            onChange={(e) => setSelectedRound(parseInt(e.target.value))}
            className="round-select"
          >
            {rounds.map(round => (
              <option key={round} value={round}>
                Rodada {round}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={simulateRound} 
          disabled={simulating || isRoundSimulated()}
          className={`simulate-btn ${isRoundSimulated() ? 'simulated' : ''}`}
        >
          {simulating ? '🔄 Simulando...' : isRoundSimulated() ? '✅ Rodada já simulada' : '🎲 Simular Rodada'}
        </button>
      </div>
      
      <div className="matches-list">
        <h4>📋 Partidas da Rodada {selectedRound}</h4>
        <div className="matches-grid">
          {matches.map((match, index) => (
            <div key={index} className={`match-card ${match.played ? 'played' : 'pending'}`}>
              <div className="match-teams">
                <span className="home-team">{match.homeTeam}</span>
                <span className="vs">VS</span>
                <span className="away-team">{match.awayTeam}</span>
              </div>
              <div className="match-result">
                <strong>Resultado:</strong> {getMatchStatus(match)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {isRoundSimulated() && selectedRound < maxRound && (
        <div className="next-round-hint">
          <button onClick={() => setSelectedRound(selectedRound + 1)}>
            ➡️ Próxima Rodada
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchSimulator;