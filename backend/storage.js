const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se arquivo não existe, retorna estrutura vazia
    return {
      teams: [],
      standings: [],
      matches: []
    };
  }
}

async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function getStandings() {
  const data = await loadData();
  return data.standings.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

async function updateStanding(teamName, updates) {
  const data = await loadData();
  const index = data.standings.findIndex(s => s.team === teamName);
  if (index !== -1) {
    data.standings[index] = { ...data.standings[index], ...updates };
    await saveData(data);
  }
}

async function getMatches(round = null) {
  const data = await loadData();
  if (round) {
    return data.matches.filter(m => m.round === round);
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

async function initializeData() {
  const teams = [
    { name: "Flamengo", abbreviation: "FLA", city: "Rio de Janeiro" },
    { name: "Palmeiras", abbreviation: "PAL", city: "São Paulo" },
    { name: "Atlético Mineiro", abbreviation: "CAM", city: "Belo Horizonte" },
    { name: "Fluminense", abbreviation: "FLU", city: "Rio de Janeiro" },
    { name: "Grêmio", abbreviation: "GRE", city: "Porto Alegre" },
    { name: "São Paulo", abbreviation: "SAO", city: "São Paulo" },
    { name: "Internacional", abbreviation: "INT", city: "Porto Alegre" },
    { name: "Corinthians", abbreviation: "COR", city: "São Paulo" },
    { name: "Santos", abbreviation: "SAN", city: "Santos" },
    { name: "Cruzeiro", abbreviation: "CRU", city: "Belo Horizonte" },
    { name: "Bahia", abbreviation: "BAH", city: "Salvador" },
    { name: "Botafogo", abbreviation: "BOT", city: "Rio de Janeiro" },
    { name: "Vasco da Gama", abbreviation: "VAS", city: "Rio de Janeiro" },
    { name: "Athletico Paranaense", abbreviation: "CAP", city: "Curitiba" },
    { name: "Fortaleza", abbreviation: "FOR", city: "Fortaleza" },
    { name: "Ceará", abbreviation: "CEA", city: "Fortaleza" },
    { name: "Goiás", abbreviation: "GOI", city: "Goiânia" },
    { name: "Cuiabá", abbreviation: "CUI", city: "Cuiabá" },
    { name: "Red Bull Bragantino", abbreviation: "RBB", city: "Bragança Paulista" },
    { name: "América Mineiro", abbreviation: "AME", city: "Belo Horizonte" }
  ];
  
  // Inicializar classificação
  const standings = teams.map(team => ({
    team: team.name,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  }));
  
  // Gerar partidas
  const matches = [];
  let round = 1;
  let matchId = 1;
  
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: matchId++,
        homeTeam: teams[i].name,
        awayTeam: teams[j].name,
        homeGoals: 0,
        awayGoals: 0,
        round: round,
        played: false
      });
      
      matches.push({
        id: matchId++,
        homeTeam: teams[j].name,
        awayTeam: teams[i].name,
        homeGoals: 0,
        awayGoals: 0,
        round: round + 1,
        played: false
      });
      
      round += 2;
      if (round > 38) round = 1;
    }
  }
  
  const data = {
    teams,
    standings,
    matches
  };
  
  await saveData(data);
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