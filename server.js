const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Hard-coded list of affirmations
const affirmations = [
  'When I finally give you the world, I\'m sure that I\'ll still owe you',
  'If earlier I knew who you were, there would have never been a search',
  'With the warmth of your voice, I can make it through any winter',
  'My memories are limited but take as many as you\'d like',
  'Meeting you was an introduction to gratitude',
  'I\'m not sure where I\'ll end up but you feel like a destination'
];

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Track each client's position in the affirmations
const clientPositions = new Map();

// API route to get a random affirmation
app.get('/api/affirmation', (req, res) => {
  const clientId = req.ip || 'default';
  
  // Get client's current position, or start at a random position if new
  let position = clientPositions.get(clientId);
  
  if (position === undefined) {
    // New visitor - start at a random position
    position = Math.floor(Math.random() * affirmations.length);
  } else {
    // Move to next affirmation in sequence
    position = (position + 1) % affirmations.length;
  }
  
  // Store updated position
  clientPositions.set(clientId, position);
  
  res.json({ 
    text: affirmations[position],
    number: position + 1,
    total: affirmations.length
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Ready to share some love! 💖`);
});