const express = require('express');
const cors = require('cors');
const storage = require('./storage');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============= ROTAS =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando!' });
});

// Buscar classificação
app.get('/api/standings', async (req, res) => {
  try {
    const standings = await storage.getStandings();
    res.json(standings);
  } catch (error) {
    console.error('Erro em /standings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Buscar partidas
app.get('/api/matches', async (req, res) => {
  try {
    const { round } = req.query;
    const matches = await storage.getMatches(round);
    
    // Log para debug
    if (round) {
      const uniqueRounds = new Set(matches.map(m => m.round));
      console.log(`📋 Buscando rodada ${round}: ${matches.length} jogos, rodadas encontradas: ${Array.from(uniqueRounds)}`);
    }
    
    res.json(matches);
  } catch (error) {
    console.error('Erro em /matches:', error);
    res.status(500).json({ error: error.message });
  }
});

// Inicializar campeonato
app.post('/api/initialize', async (req, res) => {
  try {
    console.log('🔄 Inicializando campeonato (substituindo dados)...');
    await storage.initializeData();
    const standings = await storage.getStandings();
    const matches = await storage.getMatches();
    const uniqueRounds = new Set(matches.map(m => m.round));
    
    console.log(`✅ Campeonato inicializado!`);
    console.log(`   - Times: ${standings.length}`);
    console.log(`   - Partidas: ${matches.length}`);
    console.log(`   - Rodadas: ${uniqueRounds.size}`);
    
    res.json({ 
      success: true, 
      message: "Campeonato inicializado com sucesso!",
      teamsCount: standings.length,
      matchesCount: matches.length,
      roundsCount: uniqueRounds.size
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Simular rodada
app.post('/api/matches/simulate', async (req, res) => {
  try {
    const { round } = req.body;
    console.log(`🎲 Simulando rodada ${round}...`);
    
    const matches = await storage.getMatches(round);
    
    // Verificar se a rodada existe
    if (!matches || matches.length === 0) {
      console.log(`⚠️ Rodada ${round} não encontrada!`);
      return res.status(404).json({ error: `Rodada ${round} não encontrada` });
    }
    
    const unplayedMatches = matches.filter(m => !m.played);
    
    if (unplayedMatches.length === 0) {
      console.log(`⚠️ Rodada ${round} já foi simulada!`);
      return res.json({ message: `Rodada ${round} já foi simulada!` });
    }
    
    console.log(`📋 Simulando ${unplayedMatches.length} jogos...`);
    
    // Simular cada jogo
    for (const match of unplayedMatches) {
      const homeGoals = Math.floor(Math.random() * 5);
      const awayGoals = Math.floor(Math.random() * 5);
      
      match.homeGoals = homeGoals;
      match.awayGoals = awayGoals;
      match.played = true;
      await storage.saveMatch(match);
      
      // Atualizar classificação
      await updateStandings(match.homeTeam, match.awayTeam, homeGoals, awayGoals);
      
      console.log(`   ${match.homeTeam} ${homeGoals} x ${awayGoals} ${match.awayTeam}`);
    }
    
    const updatedStandings = await storage.getStandings();
    console.log(`✅ Rodada ${round} simulada com sucesso!`);
    res.json(updatedStandings);
    
  } catch (error) {
    console.error('❌ Erro na simulação:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de debug para ver estado atual
app.get('/api/debug/status', async (req, res) => {
  try {
    const matches = await storage.getMatches();
    const uniqueRounds = new Set(matches.map(m => m.round));
    const roundsList = Array.from(uniqueRounds).sort();
    
    const roundDetails = {};
    for (const round of roundsList) {
      const roundMatches = matches.filter(m => m.round === round);
      roundDetails[round] = {
        total: roundMatches.length,
        played: roundMatches.filter(m => m.played).length,
        teams: new Set(roundMatches.flatMap(m => [m.homeTeam, m.awayTeam])).size
      };
    }
    
    res.json({
      totalMatches: matches.length,
      totalRounds: uniqueRounds.size,
      expectedRounds: 38,
      rounds: roundDetails,
      isCorrect: uniqueRounds.size === 38
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= FUNÇÃO DE ATUALIZAÇÃO =============

async function updateStandings(homeTeam, awayTeam, homeGoals, awayGoals) {
  const standings = await storage.getStandings();
  
  // Atualizar time da casa
  let home = standings.find(s => s.team === homeTeam);
  if (home) {
    home.matchesPlayed += 1;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    
    if (homeGoals > awayGoals) {
      home.wins += 1;
      home.points += 3;
    } else if (homeGoals === awayGoals) {
      home.draws += 1;
      home.points += 1;
    } else {
      home.losses += 1;
    }
    
    await storage.updateStanding(homeTeam, home);
  }
  
  // Atualizar time visitante
  let away = standings.find(s => s.team === awayTeam);
  if (away) {
    away.matchesPlayed += 1;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
    
    if (awayGoals > homeGoals) {
      away.wins += 1;
      away.points += 3;
    } else if (awayGoals === homeGoals) {
      away.draws += 1;
      away.points += 1;
    } else {
      away.losses += 1;
    }
    
    await storage.updateStanding(awayTeam, away);
  }
}

// ============= INICIAR SERVIDOR =============

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/standings`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🐛 Debug: http://localhost:${PORT}/api/debug/status`);
});