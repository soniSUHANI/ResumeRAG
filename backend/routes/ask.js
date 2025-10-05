const express = require('express');
const Resume = require('../models/Resume');
const router = express.Router();

// POST /api/ask - Query resumes
router.post('/', async (req, res) => {
  try {
    const { query, k = 3 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const allResumes = await Resume.find({});
    
    const scoredResumes = allResumes.map(resume => {
      const score = calculateRelevanceScore(resume, query);
      const snippets = extractRelevantSnippets(resume.parsedData.rawText, query);
      
      return {
        resume: {
          _id: resume._id,
          name: resume.parsedData.name,
          skills: resume.parsedData.skills
        },
        score,
        snippets: snippets.slice(0, 3)
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, parseInt(k));

    const answer = generateAnswer(scoredResumes, query);

    res.json({
      query,
      answer,
      evidence: scoredResumes,
      totalResumes: allResumes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function calculateRelevanceScore(resume, query) {
  let score = 0;
  const text = resume.parsedData.rawText.toLowerCase();
  const queryTerms = query.toLowerCase().split(' ');
  
  queryTerms.forEach(term => {
    if (text.includes(term)) {
      score += 1;
    }
  });
  
  // Boost score for skill matches
  resume.parsedData.skills.forEach(skill => {
    if (query.toLowerCase().includes(skill.toLowerCase())) {
      score += 2;
    }
  });
  
  return score;
}

function extractRelevantSnippets(text, query) {
  if (!text) return [];
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const queryTerms = query.toLowerCase().split(' ');
  
  return sentences
    .map(sentence => ({
      sentence: sentence.trim(),
      score: queryTerms.reduce((score, term) => 
        score + (sentence.toLowerCase().includes(term) ? 1 : 0), 0)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.sentence);
}

function generateAnswer(scoredResumes, query) {
  if (scoredResumes.length === 0) {
    return `No relevant information found for "${query}" in the resumes.`;
  }

  const names = scoredResumes.map(r => r.resume.name).filter(name => name !== 'Unknown');
  const nameList = names.length > 0 ? names.join(', ') : 'several candidates';
  
  return `For your query "${query}", I found relevant information in ${scoredResumes.length} resumes (${nameList}). The candidates have matching skills and experience.`;
}

module.exports = router;