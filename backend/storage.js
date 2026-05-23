const fs = require("fs").promises;
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");

// Times do Brasileirão 2025
const teams = [
  "Flamengo",
  "Palmeiras",
  "Atlético Mineiro",
  "Fluminense",
  "Grêmio",
  "São Paulo",
  "Internacional",
  "Corinthians",
  "Santos",
  "Cruzeiro",
  "Bahia",
  "Botafogo",
  "Vasco da Gama",
  "Athletico Paranaense",
  "Fortaleza",
  "Ceará",
  "Goiás",
  "Cuiabá",
  "Red Bull Bragantino",
  "América Mineiro",
];

// Lista de jogadores (artilheiros em potencial)
const players = [
  // Flamengo
  { name: "Pedro", team: "Flamengo", position: "Atacante" },
  { name: "Gabriel Barbosa", team: "Flamengo", position: "Atacante" },
  { name: "Arrascaeta", team: "Flamengo", position: "Meia" },
  { name: "Everton Ribeiro", team: "Flamengo", position: "Meia" },
  // Palmeiras
  { name: "Rony", team: "Palmeiras", position: "Atacante" },
  { name: "Raphael Veiga", team: "Palmeiras", position: "Meia" },
  { name: "Endrick", team: "Palmeiras", position: "Atacante" },
  { name: "Dudu", team: "Palmeiras", position: "Atacante" },
  // Atlético Mineiro
  { name: "Hulk", team: "Atlético Mineiro", position: "Atacante" },
  { name: "Paulinho", team: "Atlético Mineiro", position: "Atacante" },
  // Fluminense
  { name: "Germán Cano", team: "Fluminense", position: "Atacante" },
  { name: "Jhon Arias", team: "Fluminense", position: "Meia" },
  // Grêmio
  { name: "Luis Suárez", team: "Grêmio", position: "Atacante" },
  { name: "Bitello", team: "Grêmio", position: "Meia" },
  // São Paulo
  { name: "Luciano", team: "São Paulo", position: "Atacante" },
  { name: "Jonathan Calleri", team: "São Paulo", position: "Atacante" },
  // Internacional
  { name: "Alan Patrick", team: "Internacional", position: "Meia" },
  { name: "Enner Valencia", team: "Internacional", position: "Atacante" },
  // Corinthians
  { name: "Yuri Alberto", team: "Corinthians", position: "Atacante" },
  { name: "Roger Guedes", team: "Corinthians", position: "Atacante" },
  // Santos
  { name: "Marcos Leonardo", team: "Santos", position: "Atacante" },
  { name: "Soteldo", team: "Santos", position: "Meia" },
  // Cruzeiro
  { name: "Bruno Rodrigues", team: "Cruzeiro", position: "Atacante" },
  // Bahia
  { name: "Everaldo", team: "Bahia", position: "Atacante" },
  // Botafogo
  { name: "Tiquinho Soares", team: "Botafogo", position: "Atacante" },
  // Vasco
  { name: "Vegetti", team: "Vasco da Gama", position: "Atacante" },
  // Athletico-PR
  { name: "Vitor Roque", team: "Athletico Paranaense", position: "Atacante" },
  // Fortaleza
  { name: "Lucero", team: "Fortaleza", position: "Atacante" },
  // Ceará
  { name: "Mendoza", team: "Ceará", position: "Atacante" },
  // Goiás
  { name: "Matheus Peixoto", team: "Goiás", position: "Atacante" },
  // Cuiabá
  { name: "Deyverson", team: "Cuiabá", position: "Atacante" },
  // RB Bragantino
  { name: "Helinho", team: "Red Bull Bragantino", position: "Atacante" },
  // América-MG
  { name: "Felipe Azevedo", team: "América Mineiro", position: "Atacante" },
];

let nextScorerId = 1;

// Dados em memória
let memoryData = {
  standings: [],
  matches: [],
  scorers: [],
};

async function loadData() {
  return memoryData;
}

async function saveData(data) {
  memoryData = data;
  console.log(
    `💾 Dados salvos: ${memoryData.matches?.length || 0} partidas, ${memoryData.scorers?.length || 0} artilheiros`,
  );
  return true;
}

async function getStandings() {
  if (!memoryData.standings || memoryData.standings.length === 0) {
    return [];
  }
  return memoryData.standings.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

async function getMatches(round = null) {
  if (!memoryData.matches) return [];

  if (round) {
    return memoryData.matches.filter((m) => m.round === parseInt(round));
  }
  return memoryData.matches;
}

async function saveMatch(match) {
  const index = memoryData.matches.findIndex((m) => m.id === match.id);
  if (index !== -1) {
    memoryData.matches[index] = match;
  }
}

async function updateStanding(teamName, updatedData) {
  const index = memoryData.standings.findIndex((s) => s.team === teamName);
  if (index !== -1) {
    memoryData.standings[index] = updatedData;
  }
}

// ============= FUNÇÕES DE ARTILHEIROS =============

async function getScorers() {
  if (!memoryData.scorers) return [];
  console.log(`📊 Retornando ${memoryData.scorers.length} artilheiros`);
  return memoryData.scorers.sort((a, b) => b.goals - a.goals);
}

async function updateScorer(
  playerName,
  teamName,
  goalsScored,
  isPenalty = false,
) {
  console.log(`   ⚽ Registrando gol para ${playerName} (${teamName})`);

  if (!memoryData.scorers) {
    memoryData.scorers = [];
  }

  let scorer = memoryData.scorers.find(
    (s) => s.name === playerName && s.team === teamName,
  );

  if (!scorer) {
    const playerInfo = players.find(
      (p) => p.name === playerName && p.team === teamName,
    );
    scorer = {
      id: nextScorerId++,
      name: playerName,
      team: teamName,
      position: playerInfo?.position || "Atacante",
      goals: 0,
      matches: 0,
      assists: 0,
      penalties: 0,
    };
    memoryData.scorers.push(scorer);
    console.log(`   ✅ Novo jogador criado: ${playerName}`);
  }

  scorer.goals += goalsScored;
  scorer.matches += 1;
  if (isPenalty) {
    scorer.penalties += goalsScored;
  }

  console.log(`   ✅ ${playerName} agora tem ${scorer.goals} gol(s)`);
  return scorer;
}

async function addAssist(playerName, teamName) {
  if (!memoryData.scorers) {
    memoryData.scorers = [];
  }

  let scorer = memoryData.scorers.find(
    (s) => s.name === playerName && s.team === teamName,
  );

  if (!scorer) {
    const playerInfo = players.find(
      (p) => p.name === playerName && p.team === teamName,
    );
    scorer = {
      id: nextScorerId++,
      name: playerName,
      team: teamName,
      position: playerInfo?.position || "Meia",
      goals: 0,
      matches: 0,
      assists: 0,
      penalties: 0,
    };
    memoryData.scorers.push(scorer);
  }

  scorer.assists += 1;
  scorer.matches += 1;

  return scorer;
}

async function distributeGoals(teamName, goals, isHomeTeam) {
  console.log(`   🎯 Distribuindo ${goals} gols para ${teamName}`);

  const teamPlayers = players.filter((p) => p.team === teamName);

  if (teamPlayers.length === 0) {
    console.log(`   ⚠️ NENHUM JOGADOR encontrado para ${teamName}!`);
    return;
  }

  console.log(
    `   📋 Jogadores disponíveis: ${teamPlayers.map((p) => p.name).join(", ")}`,
  );

  if (goals === 0) return;

  let remainingGoals = goals;

  while (remainingGoals > 0) {
    const weights = teamPlayers.map((p) =>
      p.position === "Atacante" ? 3 : p.position === "Meia" ? 2 : 1,
    );
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    let accumulated = 0;

    for (let i = 0; i < weights.length; i++) {
      accumulated += weights[i];
      if (random <= accumulated) {
        selectedIndex = i;
        break;
      }
    }

    const scorer = teamPlayers[selectedIndex];
    const isPenalty = Math.random() < 0.1;

    await updateScorer(scorer.name, teamName, 1, isPenalty);
    remainingGoals--;
  }
}

async function distributeAssists(teamName, goals) {
  const teamPlayers = players.filter((p) => p.team === teamName);

  if (teamPlayers.length === 0 || goals === 0) return;

  for (let i = 0; i < goals; i++) {
    if (Math.random() < 0.7) {
      const randomPlayer =
        teamPlayers[Math.floor(Math.random() * teamPlayers.length)];
      await addAssist(randomPlayer.name, teamName);
    }
  }
}

// ============= FUNÇÃO DE INICIALIZAÇÃO =============

function generateCorrectSchedule() {
  const matches = [];
  let matchId = 1;
  const numTeams = teams.length;

  const allMatches = [];
  for (let i = 0; i < numTeams; i++) {
    for (let j = i + 1; j < numTeams; j++) {
      allMatches.push({
        homeTeam: teams[i],
        awayTeam: teams[j],
      });
    }
  }

  const rounds = Array(19)
    .fill()
    .map(() => []);

  for (let i = 0; i < allMatches.length; i++) {
    rounds[i % 19].push(allMatches[i]);
  }

  for (let r = 0; r < 19; r++) {
    for (const match of rounds[r]) {
      matches.push({
        id: matchId++,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeGoals: 0,
        awayGoals: 0,
        round: r + 1,
        played: false,
      });
    }
  }

  const firstTurnMatches = [...matches];
  for (const match of firstTurnMatches) {
    matches.push({
      id: matchId++,
      homeTeam: match.awayTeam,
      awayTeam: match.homeTeam,
      homeGoals: 0,
      awayGoals: 0,
      round: match.round + 19,
      played: false,
    });
  }

  console.log("=".repeat(60));
  console.log("📊 CALENDÁRIO GERADO");
  console.log("=".repeat(60));
  console.log(`Total de partidas: ${matches.length}`);
  console.log("=".repeat(60));

  return matches;
}

async function initializeData() {
  console.log("🎯 Inicializando campeonato em memória...");

  const standings = teams.map((team) => ({
    team: team,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }));

  const matches = generateCorrectSchedule();

  memoryData = {
    standings,
    matches,
    scorers: [],
  };

  console.log(`✅ CAMPEONATO INICIALIZADO!`);
  console.log(`   - Times: ${standings.length}`);
  console.log(`   - Partidas: ${matches.length}`);
  console.log(`   - Artilheiros: ${memoryData.scorers.length}`);

  return memoryData;
}

async function resetResults() {
  if (memoryData.matches && memoryData.standings) {
    memoryData.matches = memoryData.matches.map((match) => ({
      ...match,
      homeGoals: 0,
      awayGoals: 0,
      played: false,
    }));

    memoryData.standings = memoryData.standings.map((team) => ({
      ...team,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    }));

    memoryData.scorers = [];

    console.log(`🔄 Resultados resetados!`);
  }
  return memoryData;
}

// EXPORTAÇÃO DE TODAS AS FUNÇÕES
module.exports = {
  loadData,
  saveData,
  getStandings,
  updateStanding,
  getMatches,
  saveMatch,
  initializeData,
  resetResults,
  getScorers,
  updateScorer,
  addAssist,
  distributeGoals,
  distributeAssists,
};
