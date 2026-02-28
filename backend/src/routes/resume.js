const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOC are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Skill extraction keywords
const SKILL_KEYWORDS = {
  'Technical Skills': [
    'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js', 'express',
    'mongodb', 'mysql', 'postgresql', 'sql', 'html', 'css', 'typescript', 'php',
    'ruby', 'go', 'rust', 'c++', 'c#', '.net', 'spring', 'django', 'flask',
    'rest api', 'graphql', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'data science', 'data analysis', 'data visualization', 'nlp', 'computer vision',
    'git', 'github', 'jenkins', 'ci/cd', 'agile', 'scrum',
    'product management', 'prd', 'brd', 'roadmap', 'user flows', 'wireframing',
    'market research', 'competitive analysis', 'kpi', 'go-to-market'
  ],
  'Soft Skills': [
    'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical',
    'adaptability', 'time management', 'creativity', 'collaboration', 'presentation'
  ],
  'Tools': [
    'vs code', 'intellij', 'eclipse', 'jupyter', 'notion', 'slack', 'zoom',
    'tableau', 'power bi', 'excel', 'word', 'powerpoint', 'figma', 'photoshop'
  ]
};

// Extract skills from text
const extractSkills = (text) => {
  const skills = { technical: [], soft: [], tools: [] };
  const lowerText = text.toLowerCase();

  for (const skill of SKILL_KEYWORDS['Technical Skills']) {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.technical.push(skill);
    }
  }

  for (const skill of SKILL_KEYWORDS['Soft Skills']) {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.soft.push(skill);
    }
  }

  for (const tool of SKILL_KEYWORDS['Tools']) {
    if (lowerText.includes(tool.toLowerCase())) {
      skills.tools.push(tool);
    }
  }

  return skills;
};

// Determine domain based on skills
const determineDomain = (skills) => {
  const techSkills = skills.technical.map(s => s.toLowerCase());
  
  if (techSkills.some(s => s.includes('react') || s.includes('angular') || s.includes('vue') || s.includes('node'))) {
    return 'Web Development';
  }
  if (techSkills.some(s => s.includes('machine learning') || s.includes('deep learning') || s.includes('tensorflow'))) {
    return 'Data Science / ML';
  }
  if (techSkills.some(s => s.includes('aws') || s.includes('azure') || s.includes('gcp') || s.includes('docker'))) {
    return 'Cloud Computing';
  }
  if (techSkills.some(s => s.includes('python') || s.includes('java') || s.includes('c++'))) {
    return 'Software Development';
  }
  if (techSkills.some(s => s.includes('product management') || s.includes('prd') || s.includes('brd') || s.includes('roadmap') || s.includes('wireframe'))) {
    return 'Product Management';
  }
  return 'General';
};

// POST /api/resume/upload - Upload and parse resume
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume file' });
    }

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (req.file.mimetype.includes('word')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: req.file.path });
      extractedText = result.value;
    }

    const skills = extractSkills(extractedText);
    const allSkills = [...skills.technical, ...skills.soft, ...skills.tools];
    const domain = determineDomain(skills);

    let resume = await Resume.findOne({ userId: req.userId });

    if (resume) {
      resume.fileUrl = `/uploads/${req.file.filename}`;
      resume.extractedText = extractedText;
      resume.skills = allSkills;
      resume.domain = domain;
      await resume.save();
    } else {
      resume = new Resume({
        userId: req.userId,
        fileUrl: `/uploads/${req.file.filename}`,
        extractedText,
        skills: allSkills,
        domain
      });
      await resume.save();
    }

    res.json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        fileUrl: resume.fileUrl,
        skills: allSkills,
        domain,
        uploadedAt: resume.updatedAt
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Error uploading resume', error: error.message });
  }
});

// GET /api/resume/skills - Get extracted skills
router.get('/skills', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    const skills = extractSkills(resume.extractedText);

    res.json({
      skills,
      domain: resume.domain,
      hasResume: true
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/resume - Get user resume
router.get('/', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    res.json({
      id: resume._id,
      fileUrl: resume.fileUrl,
      skills: resume.skills,
      domain: resume.domain,
      uploadedAt: resume.uploadedAt
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/resume - Delete uploaded resume
router.delete('/', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ userId: req.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    const filePath = path.join(__dirname, '../../uploads', path.basename(resume.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/resume/view - View resume in browser
router.get('/view', auth, async (req, res) => {
  try {
    console.log('View resume request for user:', req.userId);
    
    const resume = await Resume.findOne({ userId: req.userId });
    
    if (!resume || !resume.fileUrl) {
      console.log('No resume found for user:', req.userId);
      return res.status(404).json({ message: 'No resume found' });
    }

    const filePath = path.join(__dirname, '../../uploads', path.basename(resume.fileUrl));
    console.log('Looking for file at:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('File not found at path:', filePath);
      return res.status(404).json({ message: 'Resume file not found on server' });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    // Set CORS headers for the file response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    
    console.log('Sending file:', filePath);
    res.sendFile(filePath);
  } catch (error) {
    console.error('View resume error:', error);
    res.status(500).json({ message: 'Error viewing resume: ' + error.message });
  }
});

module.exports = router;
