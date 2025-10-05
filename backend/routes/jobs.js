const express = require('express');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const router = express.Router();

// POST /api/jobs - Create job
router.post('/', async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/jobs/:id - Get job details
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/jobs/:id/match - Match job to candidates
router.post('/:id/match', async (req, res) => {
  try {
    const { top_n = 5 } = req.body;
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const allResumes = await Resume.find({});
    
    const matches = allResumes.map(resume => {
      const score = calculateJobMatchScore(resume, job);
      const matchingSkills = getMatchingSkills(resume.parsedData.skills, job.preferredSkills);
      const missingRequirements = getMissingRequirements(resume, job.requirements);
      
      return {
        candidate: {
          _id: resume._id,
          name: resume.parsedData.name,
          skills: resume.parsedData.skills,
          experience: resume.parsedData.experience
        },
        score,
        matchingSkills,
        missingRequirements,
        matchPercentage: Math.min(score * 20, 100) // Convert to percentage
      };
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, parseInt(top_n));

    res.json({
      job: {
        title: job.title,
        company: job.company,
        requirements: job.requirements
      },
      matches,
      summary: {
        totalCandidates: allResumes.length,
        topMatches: matches.length,
        requirements: job.requirements.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function calculateJobMatchScore(resume, job) {
  let score = 0;
  
  // Skill matching
  const skillMatch = resume.parsedData.skills.filter(skill =>
    job.preferredSkills.some(reqSkill =>
      skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
      reqSkill.toLowerCase().includes(skill.toLowerCase())
    )
  ).length;
  
  score += skillMatch;
  
  // Requirement matching
  const requirementMatch = job.requirements.filter(req =>
    resume.parsedData.rawText.toLowerCase().includes(req.toLowerCase())
  ).length;
  
  score += requirementMatch;
  
  // Experience bonus
  score += Math.min(resume.parsedData.experience.length, 3);
  
  return score;
}

function getMatchingSkills(candidateSkills, jobSkills) {
  return candidateSkills.filter(skill =>
    jobSkills.some(jobSkill =>
      skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
}

function getMissingRequirements(resume, requirements) {
  const resumeText = resume.parsedData.rawText.toLowerCase();
  return requirements.filter(req =>
    !resumeText.includes(req.toLowerCase())
  );
}

module.exports = router;