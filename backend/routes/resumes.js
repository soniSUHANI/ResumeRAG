const express = require('express');
const multer = require('multer');
const path = require('path');
const Resume = require('../models/Resume');
const resumeParser = require('../utils/resumeParser');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST /api/resumes - Upload resumes
router.post('/', upload.array('resumes', 10), async (req, res) => {
  try {
    const files = req.files;
    const results = [];

    for (const file of files) {
      try {
        const parsedData = await resumeParser.parseResume(file.path);
        
        const resume = new Resume({
          filename: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          parsedData
        });
        
        await resume.save();
        results.push({
          _id: resume._id,
          originalName: file.originalname,
          parsedData: {
            name: parsedData.name,
            skills: parsedData.skills,
            experience: parsedData.experience.length
          }
        });
      } catch (parseError) {
        console.error(`Error parsing ${file.originalname}:`, parseError);
        results.push({
          originalName: file.originalname,
          error: parseError.message
        });
      }
    }

    res.json({ 
      success: true, 
      message: `Processed ${files.length} resumes`,
      resumes: results 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error processing resumes',
      error: error.message 
    });
  }
});

// GET /api/resumes - List resumes with pagination and search
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0, q = '' } = req.query;
    
    let query = {};
    if (q) {
      query = {
        $or: [
          { 'parsedData.name': { $regex: q, $options: 'i' } },
          { 'parsedData.skills': { $regex: q, $options: 'i' } },
          { 'parsedData.rawText': { $regex: q, $options: 'i' } }
        ]
      };
    }

    const resumes = await Resume.find(query)
      .select('filename originalName uploadDate parsedData.name parsedData.skills parsedData.experience')
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .sort({ uploadDate: -1 });

    const total = await Resume.countDocuments(query);

    res.json({
      resumes,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/resumes/:id - Get specific resume
router.get('/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;