import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import StandingsTable from './components/StandingsTable';
import MatchSimulator from './components/MatchSimulator';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStandings();
  }, []);
  
  
  // Função para resetar totalmente (limpar cache do navegador)
	const hardReset = async () => {
	  try {
		// Limpar localStorage
		localStorage.clear();
		
		// Forçar recarregar dados do backend
		await initializeDatabase();
		
		// Recarregar a página
		window.location.reload();
	  } catch (err) {
		console.error('Erro no hard reset:', err);
	  }
	};


  const fetchStandings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/standings`);
      setStandings(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar classificação:', err);
      setError('Erro ao carregar classificação. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/initialize`);
      await fetchStandings();
      alert('✅ Campeonato reiniciado com sucesso!');
    } catch (err) {
      console.error('Erro ao inicializar:', err);
      alert('❌ Erro ao reiniciar o campeonato. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && standings.length === 0) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Carregando dados do campeonato...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>
            <span className="emoji">🏆</span> 
            Campeonato Brasileiro 2025
            <span className="emoji">⚽</span>
          </h1>
          <button onClick={initializeDatabase} className="init-btn" disabled={loading}>
            🔄 Reiniciar Campeonato
          </button>
		  <button onClick={hardReset} className="reset-btn" style={{background: '#ff9800', marginLeft: '10px'}}>
  🔄 Reset Total
</button>
        </div>
      </header>
      
      <main>
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={fetchStandings}>Tentar Novamente</button>
          </div>
        )}
        
        <StandingsTable standings={standings} />
        <MatchSimulator onMatchSimulated={fetchStandings} />
      </main>
    </div>
  );
}

export default App;