const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// Times do Brasileirão 2025
const teams = [
  "Flamengo", "Palmeiras", "Atlético Mineiro", "Fluminense", 
  "Grêmio", "São Paulo", "Internacional", "Corinthians", 
  "Santos", "Cruzeiro", "Bahia", "Botafogo", "Vasco da Gama", 
  "Athletico Paranaense", "Fortaleza", "Ceará", "Goiás", 
  "Cuiabá", "Red Bull Bragantino", "América Mineiro"
];

async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { standings: [], matches: [] };
  }
}

async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function getStandings() {
  const data = await loadData();
  if (!data.standings || data.standings.length === 0) {
    return [];
  }
  return data.standings.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

async function getMatches(round = null) {
  const data = await loadData();
  if (!data.matches) return [];
  
  if (round) {
    return data.matches.filter(m => m.round === parseInt(round));
  }
  return data.matches;
}

async function saveMatch(match) {
  const data = await loadData();
  const index = data.matches.findIndex(m => m.id === match.id);
  if (index !== -1) {
    data.matches[index] = match;
    await saveData(data);
  }
}

async function updateStanding(teamName, updatedData) {
  const data = await loadData();
  const index = data.standings.findIndex(s => s.team === teamName);
  if (index !== -1) {
    data.standings[index] = updatedData;
    await saveData(data);
  }
}

// Algoritmo Round Robin CORRETO para 20 times
function generateSchedule() {
  const matches = [];
  let matchId = 1;
  const numTeams = teams.length;
  const totalRounds = (numTeams - 1) * 2; // 38 rodadas
  const matchesPerRound = numTeams / 2; // 10 jogos por rodada
  
  // Criar array de times (o primeiro time fica fixo para o algoritmo)
  let clubes = [...teams];
  
  // PRIMEIRO TURNO (Rodadas 1 a 19)
  for (let rodada = 1; rodada <= numTeams - 1; rodada++) {
    // Criar os pares desta rodada
    for (let i = 0; i < matchesPerRound; i++) {
      const mandante = clubes[i];
      const visitante = clubes[numTeams - 1 - i];
      
      matches.push({
        id: matchId++,
        homeTeam: mandante,
        awayTeam: visitante,
        homeGoals: 0,
        awayGoals: 0,
        round: rodada,
        played: false
      });
    }
    
    // Rotacionar os times (exceto o primeiro que fica fixo)
    const ultimo = clubes.pop();
    clubes.splice(1, 0, ultimo);
  }
  
  // SEGUNDO TURNO (Rodadas 20 a 38) - Inverte os mandos
  for (let rodada = 20; rodada <= 38; rodada++) {
    // A rodada atual no segundo turno corresponde à rodada do primeiro turno
    const rodadaPrimeiroTurno = rodada - 19;
    
    // Buscar os jogos da rodada correspondente no primeiro turno
    const jogosPrimeiroTurno = matches.filter(m => m.round === rodadaPrimeiroTurno);
    
    // Inverter os mandos
    for (const jogo of jogosPrimeiroTurno) {
      matches.push({
        id: matchId++,
        homeTeam: jogo.awayTeam,
        awayTeam: jogo.homeTeam,
        homeGoals: 0,
        awayGoals: 0,
        round: rodada,
        played: false
      });
    }
  }
  
  // VALIDAÇÃO
  const roundsMap = new Map();
  for (const match of matches) {
    if (!roundsMap.has(match.round)) {
      roundsMap.set(match.round, []);
    }
    roundsMap.get(match.round).push(match);
  }
  
  const roundsList = Array.from(roundsMap.keys()).sort();
  
  console.log("=".repeat(60));
  console.log("📊 CALENDÁRIO GERADO");
  console.log("=".repeat(60));
  console.log(`Total de partidas: ${matches.length}`);
  console.log(`Total de rodadas: ${roundsList.length}`);
  console.log(`Primeira rodada: ${roundsList[0]}`);
  console.log(`Última rodada: ${roundsList[roundsList.length - 1]}`);
  
  // Verificar cada rodada
  let allGood = true;
  for (let r = 1; r <= 38; r++) {
    const jogos = roundsMap.get(r) || [];
    if (jogos.length !== 10) {
      console.log(`❌ Rodada ${r}: ${jogos.length} jogos (deveria ser 10)`);
      allGood = false;
    }
  }
  
  if (allGood) {
    console.log(`✅ TODAS as 38 rodadas têm exatamente 10 jogos!`);
  }
  
  // Verificar Internacional
  const rodada1 = roundsMap.get(1) || [];
  const timesRodada1 = new Set();
  rodada1.forEach(m => {
    timesRodada1.add(m.homeTeam);
    timesRodada1.add(m.awayTeam);
  });
  console.log(`\n🔍 Rodada 1: ${timesRodada1.size} times`);
  console.log(`   Internacional joga na rodada 1? ${timesRodada1.has("Internacional") ? "✅ SIM" : "❌ NÃO"}`);
  console.log("=".repeat(60));
  
  return matches;
}

// Função principal para inicializar o campeonato
async function initializeData() {
  console.log("🎯 Inicializando campeonato...");
  
  // 1. Criar classificação inicial
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
  
  // 2. Gerar jogos
  const matches = generateSchedule();
  
  // 3. Salvar dados
  const data = {
    standings: standings,
    matches: matches
  };
  
  await saveData(data);
  
  // 4. Verificar se salvou corretamente
  const savedMatches = await getMatches();
  const savedRounds = [...new Set(savedMatches.map(m => m.round))];
  
  console.log(`\n✅ CAMPEONATO INICIALIZADO:`);
  console.log(`   - Times: ${standings.length}`);
  console.log(`   - Partidas: ${savedMatches.length}`);
  console.log(`   - Rodadas: ${savedRounds.length}`);
  console.log(`   - Rodada 1: ${savedMatches.filter(m => m.round === 1).length} jogos`);
  console.log(`   - Rodada 38: ${savedMatches.filter(m => m.round === 38).length} jogos`);
  
  if (savedRounds.length !== 38) {
    throw new Error(`Falha: gerou ${savedRounds.length} rodadas`);
  }
  
  return data;
}

module.exports = {
  loadData,
  saveData,
  getStandings,
  updateStanding,
  getMatches,
  saveMatch,
  initializeData
};