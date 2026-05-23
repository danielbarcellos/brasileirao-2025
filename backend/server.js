const express = require('express');
const cors = require('cors');
const storage = require('./storage');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/standings', async (req, res) => {
  try {
    const standings = await storage.getStandings();
    res.json(standings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const { round } = req.query;
    const matches = await storage.getMatches(round ? parseInt(round) : null);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/matches/simulate', async (req, res) => {
  try {
    const { round } = req.body;
    const matches = await storage.getMatches(parseInt(round));
    const unplayedMatches = matches.filter(m => !m.played);
    
    for (const match of unplayedMatches) {
      const homeGoals = Math.floor(Math.random() * 5);
      const awayGoals = Math.floor(Math.random() * 5);
      
      match.homeGoals = homeGoals;
      match.awayGoals = awayGoals;
      match.played = true;
      await storage.saveMatch(match);
      
      await updateStandings(match.homeTeam, match.awayTeam, homeGoals, awayGoals);
    }
    
    const updatedStandings = await storage.getStandings();
    res.json(updatedStandings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/initialize', async (req, res) => {
  try {
    await storage.initializeData();
    const standings = await storage.getStandings();
    res.json(standings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function updateStandings(homeTeam, awayTeam, homeGoals, awayGoals) {
  const standings = await storage.getStandings();
  
  // Update home team
  const homeIndex = standings.findIndex(s => s.team === homeTeam);
  const home = standings[homeIndex];
  
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
  
  // Update away team
  const awayIndex = standings.findIndex(s => s.team === awayTeam);
  const away = standings[awayIndex];
  
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Storage: JSON file (data.json)`);
});