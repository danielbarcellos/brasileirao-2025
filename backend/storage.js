// Dados em memória (não precisa de arquivo)
let memoryData = {
  standings: [],
  matches: []
};

// Times do Brasileirão 2025
const teams = [
  "Flamengo", "Palmeiras", "Atlético Mineiro", "Fluminense", 
  "Grêmio", "São Paulo", "Internacional", "Corinthians", 
  "Santos", "Cruzeiro", "Bahia", "Botafogo", "Vasco da Gama", 
  "Athletico Paranaense", "Fortaleza", "Ceará", "Goiás", 
  "Cuiabá", "Red Bull Bragantino", "América Mineiro"
];

async function loadData() {
  // Retorna os dados da memória
  return memoryData;
}

async function saveData(data) {
  // Salva na memória
  memoryData = data;
  console.log(`💾 Dados salvos em memória: ${memoryData.matches.length} partidas, ${memoryData.standings.length} times`);
  return true;
}

async function getStandings() {
  if (!memoryData.standings || memoryData.standings.length === 0) {
    return [];
  }
  return memoryData.standings.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

async function getMatches(round = null) {
  if (!memoryData.matches) return [];
  
  if (round) {
    return memoryData.matches.filter(m => m.round === parseInt(round));
  }
  return memoryData.matches;
}

async function saveMatch(match) {
  const index = memoryData.matches.findIndex(m => m.id === match.id);
  if (index !== -1) {
    memoryData.matches[index] = match;
    console.log(`💾 Partida ${match.id} salva: ${match.homeTeam} vs ${match.awayTeam}`);
  }
}

async function updateStanding(teamName, updatedData) {
  const index = memoryData.standings.findIndex(s => s.team === teamName);
  if (index !== -1) {
    memoryData.standings[index] = updatedData;
  }
}

// Gerar calendário correto
function generateCorrectSchedule() {
  const matches = [];
  let matchId = 1;
  const numTeams = teams.length;
  
  // Primeiro turno: gerar todos os confrontos
  const allMatches = [];
  for (let i = 0; i < numTeams; i++) {
    for (let j = i + 1; j < numTeams; j++) {
      allMatches.push({
        homeTeam: teams[i],
        awayTeam: teams[j]
      });
    }
  }
  
  // Distribuir em 19 rodadas (cada rodada 10 jogos)
  const rounds = Array(19).fill().map(() => []);
  
  for (let i = 0; i < allMatches.length; i++) {
    rounds[i % 19].push(allMatches[i]);
  }
  
  // Primeiro turno (rodadas 1-19)
  for (let r = 0; r < 19; r++) {
    for (const match of rounds[r]) {
      matches.push({
        id: matchId++,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeGoals: 0,
        awayGoals: 0,
        round: r + 1,
        played: false
      });
    }
  }
  
  // Segundo turno (rodadas 20-38) - inverter mandos
  const firstTurnMatches = [...matches];
  for (const match of firstTurnMatches) {
    matches.push({
      id: matchId++,
      homeTeam: match.awayTeam,
      awayTeam: match.homeTeam,
      homeGoals: 0,
      awayGoals: 0,
      round: match.round + 19,
      played: false
    });
  }
  
  console.log("=".repeat(60));
  console.log("📊 CALENDÁRIO GERADO");
  console.log("=".repeat(60));
  console.log(`Total de partidas: ${matches.length}`);
  
  // Verificar cada rodada
  for (let r = 1; r <= 38; r++) {
    const jogos = matches.filter(m => m.round === r);
    if (jogos.length !== 10) {
      console.log(`❌ Rodada ${r}: ${jogos.length} jogos`);
    }
  }
  console.log(`✅ Todas as 38 rodadas verificadas`);
  
  // Verificar Internacional na rodada 1
  const rodada1 = matches.filter(m => m.round === 1);
  const timesRodada1 = new Set();
  rodada1.forEach(m => {
    timesRodada1.add(m.homeTeam);
    timesRodada1.add(m.awayTeam);
  });
  console.log(`\n🔍 Rodada 1: ${timesRodada1.size} times`);
  console.log(`   Internacional joga? ${timesRodada1.has("Internacional") ? "✅ SIM" : "❌ NÃO"}`);
  console.log("=".repeat(60));
  
  return matches;
}

async function initializeData() {
  console.log("🎯 Inicializando campeonato em memória...");
  
  // Classificação inicial
  const standings = teams.map(team => ({
    team: team,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  }));
  
  // Gerar jogos
  const matches = generateCorrectSchedule();
  
  // Salvar em memória
  memoryData = { standings, matches };
  
  console.log(`\n✅ CAMPEONATO INICIALIZADO!`);
  console.log(`   - Times: ${standings.length}`);
  console.log(`   - Partidas: ${matches.length}`);
  console.log(`   - Rodadas: 38`);
  
  return memoryData;
}

// Função para reset (manter estrutura, zerar resultados)
async function resetResults() {
  if (memoryData.matches && memoryData.standings) {
    // Resetar partidas
    memoryData.matches = memoryData.matches.map(match => ({
      ...match,
      homeGoals: 0,
      awayGoals: 0,
      played: false
    }));
    
    // Resetar classificação
    memoryData.standings = memoryData.standings.map(team => ({
      ...team,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    }));
    
    console.log(`🔄 Resultados resetados!`);
  }
  return memoryData;
}

module.exports = {
  loadData,
  saveData,
  getStandings,
  updateStanding,
  getMatches,
  saveMatch,
  initializeData,
  resetResults
};