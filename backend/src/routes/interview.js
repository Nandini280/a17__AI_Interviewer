const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');

// Question Bank
const QUESTION_BANK = {
  Python: [
    { question: "Explain Python decorators and provide an example.", category: "Technical", difficulty: "Medium", expectedKeywords: ["function", "wrapper", "@decorator", "args", "kwargs"], skill: "Python" },
    { question: "What is the difference between Python's list and tuple?", category: "Technical", difficulty: "Easy", expectedKeywords: ["mutable", "immutable", "parentheses", "square brackets"], skill: "Python" },
    { question: "Explain Python's GIL (Global Interpreter Lock).", category: "Technical", difficulty: "Hard", expectedKeywords: ["threading", "multiprocessing", "concurrency", "CPU-bound"], skill: "Python" },
    { question: "What are Python list comprehensions?", category: "Technical", difficulty: "Easy", expectedKeywords: ["syntax", "loop", "filter", "map"], skill: "Python" },
    { question: "Explain virtual environments in Python.", category: "Technical", difficulty: "Medium", expectedKeywords: ["isolation", "dependencies", "pip", "venv"], skill: "Python" }
  ],
  Java: [
    { question: "Explain the difference between JDK, JRE, and JVM.", category: "Technical", difficulty: "Medium", expectedKeywords: ["JDK", "JRE", "JVM", "compile", "bytecode"], skill: "Java" },
    { question: "What are the main principles of OOP?", category: "Technical", difficulty: "Easy", expectedKeywords: ["encapsulation", "inheritance", "polymorphism", "abstraction"], skill: "Java" },
    { question: "Explain the Spring Boot framework.", category: "Technical", difficulty: "Medium", expectedKeywords: ["framework", "annotations", "dependency injection", "microservices"], skill: "Java" },
    { question: "What is the difference between abstract class and interface?", category: "Technical", difficulty: "Medium", expectedKeywords: ["abstract", "interface", "implementation", "extends", "implements"], skill: "Java" },
    { question: "Explain Java multithreading.", category: "Technical", difficulty: "Hard", expectedKeywords: ["thread", "runnable", "synchronization", "lock", "deadlock"], skill: "Java" }
  ],
  React: [
    { question: "Explain React component lifecycle methods.", category: "Technical", difficulty: "Medium", expectedKeywords: ["componentDidMount", "componentDidUpdate", "componentWillUnmount", "hooks", "useEffect"], skill: "React" },
    { question: "What is the difference between props and state?", category: "Technical", difficulty: "Easy", expectedKeywords: ["props", "state", "immutable", "mutable", "parent", "child"], skill: "React" },
    { question: "Explain React hooks and their use cases.", category: "Technical", difficulty: "Medium", expectedKeywords: ["useState", "useEffect", "useContext", "useRef", "custom hooks"], skill: "React" },
    { question: "What is Redux and how does it work?", category: "Technical", difficulty: "Hard", expectedKeywords: ["store", "dispatch", "reducer", "action", "state management"], skill: "React" },
    { question: "Explain virtual DOM in React.", category: "Technical", difficulty: "Medium", expectedKeywords: ["virtual DOM", "reconciliation", "diffing", "performance"], skill: "React" }
  ],
  "Node.js": [
    { question: "Explain Node.js event loop.", category: "Technical", difficulty: "Hard", expectedKeywords: ["event loop", "callback", "promise", "async", "non-blocking"], skill: "Node.js" },
    { question: "What is Express.js middleware?", category: "Technical", difficulty: "Medium", expectedKeywords: ["middleware", "request", "response", "next", "function"], skill: "Node.js" },
    { question: "Explain RESTful API design principles.", category: "Technical", difficulty: "Medium", expectedKeywords: ["REST", "HTTP methods", "CRUD", "endpoint", "resource"], skill: "Node.js" },
    { question: "What is the difference between Node.js and Express?", category: "Technical", difficulty: "Easy", expectedKeywords: ["runtime", "framework", "HTTP", "server"], skill: "Node.js" },
    { question: "Explain asynchronous programming in Node.js.", category: "Technical", difficulty: "Medium", expectedKeywords: ["async", "await", "callback", "promise", "non-blocking"], skill: "Node.js" }
  ],
  "Machine Learning": [
    { question: "Explain the bias-variance tradeoff.", category: "Technical", difficulty: "Medium", expectedKeywords: ["bias", "variance", "overfitting", "underfitting", "model complexity"], skill: "Machine Learning" },
    { question: "What is the difference between supervised and unsupervised learning?", category: "Technical", difficulty: "Easy", expectedKeywords: ["supervised", "unsupervised", "labeled", "unlabeled", "classification", "clustering"], skill: "Machine Learning" },
    { question: "Explain gradient descent.", category: "Technical", difficulty: "Hard", expectedKeywords: ["gradient", "optimization", "learning rate", "cost function", "iteration"], skill: "Machine Learning" },
    { question: "What are the main types of neural networks?", category: "Technical", difficulty: "Medium", expectedKeywords: ["CNN", "RNN", "feedforward", "deep learning", "layers"], skill: "Machine Learning" },
    { question: "Explain overfitting and how to prevent it.", category: "Technical", difficulty: "Medium", expectedKeywords: ["overfitting", "regularization", "cross-validation", "dropout", "training data"], skill: "Machine Learning" }
  ],
  "Data Science": [
    { question: "What is data preprocessing?", category: "Technical", difficulty: "Easy", expectedKeywords: ["cleaning", "normalization", "missing values", "encoding", "feature scaling"], skill: "Data Science" },
    { question: "Explain the difference between regression and classification.", category: "Technical", difficulty: "Easy", expectedKeywords: ["regression", "classification", "continuous", "categorical", "supervised"], skill: "Data Science" },
    { question: "What is feature engineering?", category: "Technical", difficulty: "Medium", expectedKeywords: ["feature", "engineering", "selection", "extraction", "transformation"], skill: "Data Science" },
    { question: "Explain confusion matrix.", category: "Technical", difficulty: "Medium", expectedKeywords: ["confusion matrix", "accuracy", "precision", "recall", "F1 score"], skill: "Data Science" },
    { question: "What is cross-validation?", category: "Technical", difficulty: "Medium", expectedKeywords: ["cross-validation", "train", "test", "validation", "overfitting"], skill: "Data Science" }
  ],
  AWS: [
    { question: "Explain AWS EC2 instances.", category: "Technical", difficulty: "Medium", expectedKeywords: ["EC2", "instance", "virtual server", "AWS", "cloud"], skill: "AWS" },
    { question: "What is AWS S3?", category: "Technical", difficulty: "Easy", expectedKeywords: ["S3", "storage", "bucket", "object", "AWS"], skill: "AWS" },
    { question: "Explain AWS Lambda.", category: "Technical", difficulty: "Medium", expectedKeywords: ["Lambda", "serverless", "function", "event", "AWS"], skill: "AWS" },
    { question: "What is the difference between AWS EC2 and Lambda?", category: "Technical", difficulty: "Medium", expectedKeywords: ["EC2", "Lambda", "server", "serverless", "scaling"], skill: "AWS" },
    { question: "Explain AWS IAM.", category: "Technical", difficulty: "Medium", expectedKeywords: ["IAM", "authentication", "authorization", "policy", "role"], skill: "AWS" }
  ],
  SQL: [
    { question: "Explain the difference between SQL and NoSQL databases.", category: "Technical", difficulty: "Medium", expectedKeywords: ["SQL", "NoSQL", "relational", "schema", "ACID", "CAP"], skill: "SQL" },
    { question: "What are SQL joins and their types?", category: "Technical", difficulty: "Medium", expectedKeywords: ["JOIN", "INNER", "LEFT", "RIGHT", "FULL", "table"], skill: "SQL" },
    { question: "Explain database normalization.", category: "Technical", difficulty: "Hard", expectedKeywords: ["normalization", "1NF", "2NF", "3NF", "database design"], skill: "SQL" },
    { question: "What is indexing in databases?", category: "Technical", difficulty: "Medium", expectedKeywords: ["index", "performance", "query", "B-tree", "hash"], skill: "SQL" },
    { question: "Explain SQL subqueries.", category: "Technical", difficulty: "Medium", expectedKeywords: ["subquery", "nested", "query", "SELECT", "WHERE"], skill: "SQL" }
  ],
  HR: [
    { question: "Tell me about yourself.", category: "HR", difficulty: "Easy", expectedKeywords: ["background", "experience", "goals", "strengths", "career"], skill: "General" },
    { question: "What are your strengths and weaknesses?", category: "HR", difficulty: "Easy", expectedKeywords: ["strengths", "weaknesses", "self-awareness", "improvement"], skill: "General" },
    { question: "Why do you want to work for this company?", category: "HR", difficulty: "Easy", expectedKeywords: ["company", "motivation", "goals", "values", "culture"], skill: "General" },
    { question: "Where do you see yourself in 5 years?", category: "HR", difficulty: "Easy", expectedKeywords: ["career", "goals", "growth", "aspirations", "plan"], skill: "General" },
    { question: "What are your salary expectations?", category: "HR", difficulty: "Medium", expectedKeywords: ["salary", "expectations", "research", "value", "negotiation"], skill: "General" }
  ],
  Behavioral: [
    { question: "Describe a challenging project you worked on.", category: "Behavioral", difficulty: "Medium", expectedKeywords: ["challenge", "project", "solution", "result", "learning"], skill: "General" },
    { question: "Tell me about a time you failed and what you learned.", category: "Behavioral", difficulty: "Medium", expectedKeywords: ["failure", "learning", "reflection", "improvement", "growth"], skill: "General" },
    { question: "Describe a time you worked in a team.", category: "Behavioral", difficulty: "Easy", expectedKeywords: ["team", "collaboration", "conflict", "contribution", "success"], skill: "General" },
    { question: "Tell me about a time you had to meet a tight deadline.", category: "Behavioral", difficulty: "Medium", expectedKeywords: ["deadline", "pressure", "prioritization", "time management", "result"], skill: "General" },
    { question: "Describe a situation where you had to adapt to change.", category: "Behavioral", difficulty: "Medium", expectedKeywords: ["change", "adaptability", "flexibility", "new situation", "outcome"], skill: "General" }
  ],
  "Product Management": [
    { question: "What is the difference between a PRD and a BRD?", category: "Technical", difficulty: "Medium", expectedKeywords: ["PRD", "BRD", "requirements", "features", "specifications"], skill: "Product Management" },
    { question: "How do you prioritize features using the RICE framework?", category: "Technical", difficulty: "Medium", expectedKeywords: ["RICE", "reach", "impact", "confidence", "effort", "prioritization"], skill: "Product Management" },
    { question: "Explain the product lifecycle stages.", category: "Technical", difficulty: "Easy", expectedKeywords: ["introduction", "growth", "maturity", "decline", "launch"], skill: "Product Management" },
    { question: "How do you conduct market research for a new product?", category: "Technical", difficulty: "Medium", expectedKeywords: ["market research", "competitor analysis", "user interviews", "surveys", "data"], skill: "Product Management" },
    { question: "What is the difference between Agile and Waterfall product development?", category: "Technical", difficulty: "Medium", expectedKeywords: ["Agile", "Waterfall", "iterative", "sequential", "flexibility", "planning"], skill: "Product Management" },
    { question: "How do you define KPIs for a product?", category: "Technical", difficulty: "Medium", expectedKeywords: ["KPI", "metrics", "goals", "measurement", "success"], skill: "Product Management" },
    { question: "What is a product roadmap and how do you create one?", category: "Technical", difficulty: "Medium", expectedKeywords: ["roadmap", "strategy", "timeline", "features", "priorities"], skill: "Product Management" },
    { question: "How do you gather and analyze customer insights?", category: "Technical", difficulty: "Medium", expectedKeywords: ["customer insights", "user feedback", "data analysis", "pain points", "requirements"], skill: "Product Management" }
  ],
  Wireframing: [
    { question: "What is the difference between low-fidelity and high-fidelity wireframes?", category: "Technical", difficulty: "Easy", expectedKeywords: ["low-fi", "high-fi", "wireframe", "detail", "prototype"], skill: "Wireframing" },
    { question: "What tools do you use for wireframing?", category: "Technical", difficulty: "Easy", expectedKeywords: ["Figma", "Sketch", "Adobe XD", "wireframe", "design"], skill: "Wireframing" },
    { question: "Explain the importance of wireframing in product development.", category: "Technical", difficulty: "Easy", expectedKeywords: ["wireframe", "layout", "usability", "feedback", "iteration"], skill: "Wireframing" },
    { question: "How do you create user flows?", category: "Technical", difficulty: "Medium", expectedKeywords: ["user flow", "path", "steps", "experience", "mapping"], skill: "Wireframing" },
    { question: "What is the difference between a wireframe and a mockup?", category: "Technical", difficulty: "Easy", expectedKeywords: ["wireframe", "mockup", "design", "visual", "prototype"], skill: "Wireframing" }
  ],
  "Go-to-Market Strategy": [
    { question: "What are the key components of a go-to-market strategy?", category: "Technical", difficulty: "Medium", expectedKeywords: ["GTM", "strategy", "launch", "marketing", "sales", "channels"], skill: "Go-to-Market Strategy" },
    { question: "How do you measure the success of a product launch?", category: "Technical", difficulty: "Medium", expectedKeywords: ["launch", "metrics", "KPI", "adoption", "revenue", "success"], skill: "Go-to-Market Strategy" },
    { question: "What is the difference between B2B and B2C go-to-market strategies?", category: "Technical", difficulty: "Medium", expectedKeywords: ["B2B", "B2C", "strategy", "customers", "channels"], skill: "Go-to-Market Strategy" },
    { question: "How do you identify target customers for a product?", category: "Technical", difficulty: "Medium", expectedKeywords: ["target customers", "persona", "segmentation", "market", "research"], skill: "Go-to-Market Strategy" },
    { question: "What is competitive analysis and how do you perform it?", category: "Technical", difficulty: "Medium", expectedKeywords: ["competitive", "analysis", "competitors", "market", "differentiation"], skill: "Go-to-Market Strategy" }
  ],
  Flask: [
    { question: "Explain the Flask application structure.", category: "Technical", difficulty: "Medium", expectedKeywords: ["Flask", "app", "route", "view", "application"], skill: "Flask" },
    { question: "What is the difference between Flask and Django?", category: "Technical", difficulty: "Medium", expectedKeywords: ["Flask", "Django", "framework", "Python", "web"], skill: "Flask" },
    { question: "How do you handle database connections in Flask?", category: "Technical", difficulty: "Medium", expectedKeywords: ["Flask", "SQLAlchemy", "database", "ORM", "connection"], skill: "Flask" },
    { question: "What are Flask Blueprints?", category: "Technical", difficulty: "Medium", expectedKeywords: ["Flask", "Blueprint", "modular", "application", "route"], skill: "Flask" },
    { question: "Explain Flask routing and decorators.", category: "Technical", difficulty: "Medium", expectedKeywords: ["Flask", "route", "decorator", "URL", "endpoint"], skill: "Flask" }
  ],
  HTML: [
    { question: "What is the difference between HTML and HTML5?", category: "Technical", difficulty: "Easy", expectedKeywords: ["HTML", "HTML5", "semantic", "tags", "elements"], skill: "HTML" },
    { question: "Explain the box model in CSS.", category: "Technical", difficulty: "Medium", expectedKeywords: ["box model", "margin", "padding", "border", "content"], skill: "HTML" },
    { question: "What are semantic HTML elements?", category: "Technical", difficulty: "Easy", expectedKeywords: ["semantic", "HTML", "header", "footer", "article", "section"], skill: "HTML" },
    { question: "How do you make a website responsive?", category: "Technical", difficulty: "Medium", expectedKeywords: ["responsive", "media query", "CSS", "mobile", "breakpoint"], skill: "HTML" },
    { question: "What is the difference between Flexbox and Grid?", category: "Technical", difficulty: "Medium", expectedKeywords: ["Flexbox", "Grid", "CSS", "layout", "responsive"], skill: "HTML" }
  ]
};

// Skill mapping - lowercase to proper case
const SKILL_MAPPING = {
  'python': 'Python',
  'java': 'Java',
  'javascript': 'React',
  'react': 'React',
  'angular': 'React',
  'vue': 'React',
  'node.js': 'Node.js',
  'node': 'Node.js',
  'express': 'Node.js',
  'mongodb': 'Node.js',
  'mysql': 'SQL',
  'postgresql': 'SQL',
  'sql': 'SQL',
  'html': 'HTML',
  'css': 'HTML',
  'typescript': 'React',
  'php': 'Python',
  'ruby': 'Python',
  'go': 'Python',
  'rust': 'Python',
  'c++': 'Java',
  'c#': 'Java',
  '.net': 'Java',
  'spring': 'Java',
  'django': 'Flask',
  'flask': 'Flask',
  'aws': 'AWS',
  'azure': 'AWS',
  'gcp': 'AWS',
  'docker': 'AWS',
  'kubernetes': 'AWS',
  'machine learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'deep learning': 'Machine Learning',
  'tensorflow': 'Machine Learning',
  'pytorch': 'Machine Learning',
  'data science': 'Data Science',
  'data analysis': 'Data Science',
  'data visualization': 'Data Science',
  'nlp': 'Machine Learning',
  'computer vision': 'Machine Learning',
  'product management': 'Product Management',
  'prd': 'Product Management',
  'brd': 'Product Management',
  'roadmap': 'Product Management',
  'wireframing': 'Wireframing',
  'wireframe': 'Wireframing',
  'figma': 'Wireframing',
  'market research': 'Go-to-Market Strategy',
  'competitive analysis': 'Go-to-Market Strategy',
  'kpi': 'Go-to-Market Strategy',
  'go-to-market': 'Go-to-Market Strategy'
};

// Generate questions based on skills
const generateQuestions = (skills) => {
  const questions = [];
  const usedQuestions = new Set();
  
  // If no skills provided, use default technical skills
  const defaultSkills = ['Python', 'React', 'JavaScript'];
  
  // Convert skills to proper case for matching
  const mappedSkills = skills && skills.length > 0 
    ? skills.map(s => {
        const lower = s.toLowerCase().trim();
        return SKILL_MAPPING[lower] || (lower.charAt(0).toUpperCase() + lower.slice(1));
      })
    : defaultSkills;
  
  // Filter out soft skills and get unique skills
  const techSkills = mappedSkills.filter(s => 
    !['Leadership', 'Communication', 'Teamwork', 'Problem-solving', 'General'].includes(s)
  );
  
  // Get unique skills (remove duplicates)
  const uniqueSkills = [...new Set(techSkills)];
  const selectedSkills = uniqueSkills.slice(0, 3);
  
  // Add up to 3 technical questions based on skills
  selectedSkills.forEach(skill => {
    if (questions.length >= 5) return;
    
    // Try exact match first, then try case-insensitive
    let skillQuestions = QUESTION_BANK[skill];
    
    // If no exact match, try to find matching key
    if (!skillQuestions) {
      const matchingKey = Object.keys(QUESTION_BANK).find(
        key => key.toLowerCase() === skill.toLowerCase()
      );
      if (matchingKey) {
        skillQuestions = QUESTION_BANK[matchingKey];
        skill = matchingKey;
      }
    }
    
    if (skillQuestions && skillQuestions.length > 0) {
      // Shuffle and pick a unique question
      const shuffled = [...skillQuestions].sort(() => 0.5 - Math.random());
      for (const q of shuffled) {
        if (!usedQuestions.has(q.question) && questions.length < 5) {
          questions.push({ 
            questionText: q.question,
            category: q.category,
            difficulty: q.difficulty,
            expectedKeywords: q.expectedKeywords,
            skill: skill
          });
          usedQuestions.add(q.question);
          break;
        }
      }
    }
  });
  
  // Add 1 HR question (if not already 5)
  if (questions.length < 5) {
    const hrQuestions = QUESTION_BANK['HR'];
    if (hrQuestions && hrQuestions.length > 0) {
      const shuffledHR = [...hrQuestions].sort(() => 0.5 - Math.random());
      for (const q of shuffledHR) {
        if (!usedQuestions.has(q.question) && questions.length < 5) {
          questions.push({ 
            questionText: q.question,
            category: q.category,
            difficulty: q.difficulty,
            expectedKeywords: q.expectedKeywords,
            skill: 'General'
          });
          usedQuestions.add(q.question);
          break;
        }
      }
    }
  }
  
  // Add 1 Behavioral question (if not already 5)
  if (questions.length < 5) {
    const behavioralQuestions = QUESTION_BANK['Behavioral'];
    if (behavioralQuestions && behavioralQuestions.length > 0) {
      const shuffledBehavioral = [...behavioralQuestions].sort(() => 0.5 - Math.random());
      for (const q of shuffledBehavioral) {
        if (!usedQuestions.has(q.question) && questions.length < 5) {
          questions.push({ 
            questionText: q.question,
            category: q.category,
            difficulty: q.difficulty,
            expectedKeywords: q.expectedKeywords,
            skill: 'General'
          });
          usedQuestions.add(q.question);
          break;
        }
      }
    }
  }
  
  // If still don't have 5 questions, fill with unique default questions from HR
  const defaultQuestions = [
    "Tell me about yourself and your technical background.",
    "What are your greatest strengths and weaknesses?",
    "Why should we hire you?",
    "Describe your ideal work environment.",
    "What motivates you to do your best work?"
  ];
  
  let defaultIndex = 0;
  while (questions.length < 5) {
    const defaultQ = defaultQuestions[defaultIndex] || "Describe your technical journey.";
    if (!usedQuestions.has(defaultQ)) {
      questions.push({ 
        questionText: defaultQ,
        category: "HR",
        difficulty: "Easy",
        expectedKeywords: ["background", "experience", "skills"],
        skill: "General"
      });
      usedQuestions.add(defaultQ);
    }
    defaultIndex++;
  }
  
  return questions.slice(0, 5);
};

// Simple evaluation function
const evaluateAnswer = (answerText, expectedKeywords, questionCategory) => {
  // Ensure we have a valid answer
  if (!answerText || answerText.trim().length === 0) {
    return {
      technical: 0,
      communication: 0,
      overall: 0,
      feedback: 'No answer provided.',
      strengths: [],
      weaknesses: ['No answer given']
    };
  }
  
  const lowerAnswer = answerText.toLowerCase().trim();
  const wordCount = lowerAnswer.split(/\s+/).filter(w => w.length > 0).length;
  
  // Keyword matching (30%)
  let keywordScore = 0;
  if (expectedKeywords && expectedKeywords.length > 0) {
    const matchedKeywords = expectedKeywords.filter(kw => 
      lowerAnswer.includes(kw.toLowerCase().trim())
    );
    keywordScore = (matchedKeywords.length / expectedKeywords.length) * 30;
  }
  
  // Answer length and structure (20%)
  let lengthScore = 0;
  if (wordCount >= 80) lengthScore = 20;
  else if (wordCount >= 50) lengthScore = 16;
  else if (wordCount >= 30) lengthScore = 12;
  else if (wordCount >= 15) lengthScore = 8;
  else if (wordCount >= 5) lengthScore = 4;
  else lengthScore = 1;
  
  // Basic grammar check - look for proper sentence structure (20%)
  const hasMultipleSentences = (answerText.match(/[.!?]+/g) || []).length >= 1;
  const hasProperPunctuation = answerText.includes('.') || answerText.includes('!') || answerText.includes('?');
  const hasCapitalization = /^[A-Z]/.test(answerText.trim());
  let grammarScore = 0;
  if (hasMultipleSentences && hasProperPunctuation && hasCapitalization) grammarScore = 20;
  else if (hasProperPunctuation && hasCapitalization) grammarScore = 15;
  else if (hasCapitalization) grammarScore = 10;
  else grammarScore = 5;
  
  // Relevance check - does answer have meaningful content (30%)
  let relevanceScore = 0;
  if (wordCount >= 20 && keywordScore >= 10) relevanceScore = 30;
  else if (wordCount >= 15 && keywordScore >= 5) relevanceScore = 25;
  else if (wordCount >= 10) relevanceScore = 20;
  else if (wordCount >= 5) relevanceScore = 15;
  else relevanceScore = 10;
  
  // Calculate total score
  const totalScore = Math.min(100, Math.round(keywordScore + lengthScore + grammarScore + relevanceScore));
  
  // Generate feedback based on actual score
  let feedback = '';
  let strengths = [];
  let weaknesses = [];
  
  if (totalScore >= 80) {
    feedback = 'Excellent answer! You demonstrated a strong understanding of the topic with good examples and technical depth.';
    strengths = ['Strong technical knowledge', 'Clear and structured response', 'Relevant examples provided'];
  } else if (totalScore >= 60) {
    feedback = 'Good answer! You have a decent understanding but could add more specific details.';
    strengths = ['Good understanding shown', 'Relevant points covered', 'Clear communication'];
    weaknesses = ['Could provide more depth', 'Add more specific examples'];
  } else if (totalScore >= 40) {
    feedback = 'Average answer. Consider expanding your response with more details and examples.';
    strengths = ['Basic understanding present'];
    weaknesses = ['Need more detail', 'Missing specific examples', 'Could be more structured'];
  } else {
    feedback = 'Your answer needs significant improvement. Please study this topic more thoroughly and practice explaining concepts.';
    weaknesses = ['Limited understanding of topic', 'Answer too short', 'Missing key concepts', 'Need more specific examples'];
  }
  
  return {
    technical: questionCategory === 'Technical' ? totalScore : Math.round(totalScore * 0.85),
    communication: Math.max(10, Math.round((grammarScore + lengthScore) / 2 + (wordCount > 20 ? 10 : 0))),
    overall: totalScore,
    feedback,
    strengths,
    weaknesses
  };
};

// POST /api/interview/start - Initialize new interview
router.post('/start', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId });
    
    if (!resume || resume.skills.length === 0) {
      return res.status(400).json({ message: 'Please upload a resume first to generate questions' });
    }
    
    const questions = generateQuestions(resume.skills);
    
    const interview = new Interview({
      userId: req.userId,
      resumeId: resume._id,
      questions,
      answers: [],
      skillsTested: questions.filter(q => q.category === 'Technical').map(q => q.skill),
      status: 'in-progress'
    });
    
    await interview.save();
    
    res.json({
      message: 'Interview started',
      interviewId: interview._id,
      questions: interview.questions.map((q, index) => ({
        number: index + 1,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty
      }))
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/interview/history - Get all past interviews
router.get('/history', auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('overallScore technicalScore communicationScore status skillsTested createdAt questions answers');
    
    res.json({
      interviews: interviews.map(i => {
        // Generate title from skills tested
        const title = i.skillsTested && i.skillsTested.length > 0 
          ? `${i.skillsTested.join(' + ')} Interview`
          : 'Mock Interview';
        
        // Calculate progress based on answers vs questions
        const progress = i.questions && i.questions.length > 0
          ? Math.round((i.answers.length / i.questions.length) * 100)
          : 0;
        
        return {
          id: i._id,
          title: title,
          overallScore: i.overallScore,
          technicalScore: i.technicalScore,
          communicationScore: i.communicationScore,
          status: i.status,
          skillsTested: i.skillsTested,
          progress: progress,
          date: i.createdAt
        };
      })
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/interview/:id/questions - Get interview questions
router.get('/:id/questions', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    res.json({
      questions: interview.questions.map((q, index) => ({
        number: index + 1,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty
      }))
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/interview/results/:id - Get interview results
router.get('/results/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    res.json({
      overallScore: interview.overallScore,
      technicalScore: interview.technicalScore,
      communicationScore: interview.communicationScore,
      confidenceLevel: interview.confidenceLevel,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,
      improvementTips: interview.improvementTips,
      skillsTested: interview.skillsTested,
      answers: interview.answers,
      questions: interview.questions,
      createdAt: interview.createdAt,
      completedAt: interview.completedAt
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/interview/:id - Delete an interview
router.delete('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    await Interview.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user/dashboard - Get dashboard statistics
router.get('/user/dashboard', auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId, status: 'completed' });
    const resume = await Resume.findOne({ userId: req.userId });
    
    const totalInterviews = interviews.length;
    const avgScore = totalInterviews > 0 
      ? Math.round(interviews.reduce((sum, i) => sum + i.overallScore, 0) / totalInterviews)
      : 0;
    const skillsIdentified = resume ? resume.skills.length : 0;
    
    res.json({
      totalInterviews,
      averageScore: avgScore,
      skillsIdentified,
      recentInterviews: interviews.slice(0, 5).map(i => ({
        id: i._id,
        score: i.overallScore,
        date: i.createdAt
      }))
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/interview/:id/answer - Submit answer
router.post('/:id/answer', auth, async (req, res) => {
  try {
    const { questionIndex, answerText, answerType } = req.body;
    
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    if (questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ message: 'Invalid question index' });
    }
    
    const question = interview.questions[questionIndex];
    const evaluation = evaluateAnswer(answerText, question.expectedKeywords, question.category);
    
    // Update or add answer
    const existingAnswerIndex = interview.answers.findIndex(a => 
      a.questionText === question.questionText
    );
    
    const answerData = {
      questionText: question.questionText,
      answerText,
      answerType: answerType || 'text',
      scores: evaluation,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses
    };
    
    if (existingAnswerIndex >= 0) {
      interview.answers[existingAnswerIndex] = answerData;
    } else {
      interview.answers.push(answerData);
    }
    
    await interview.save();
    
    res.json({
      message: 'Answer submitted',
      evaluation
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/interview/:id/finish - Complete interview
router.post('/:id/finish', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    // Calculate overall scores
    if (interview.answers.length > 0) {
      const totalTechnical = interview.answers
        .filter(a => interview.questions.find(q => q.questionText === a.questionText)?.category === 'Technical')
        .reduce((sum, a) => sum + a.scores.technical, 0);
      
      const technicalCount = interview.answers.filter(a => 
        interview.questions.find(q => q.questionText === a.questionText)?.category === 'Technical'
      ).length;
      
      interview.technicalScore = technicalCount > 0 ? Math.round(totalTechnical / technicalCount) : 0;
      
      const totalComm = interview.answers.reduce((sum, a) => sum + a.scores.communication, 0);
      interview.communicationScore = Math.round(totalComm / interview.answers.length);
      
      const totalOverall = interview.answers.reduce((sum, a) => sum + a.scores.overall, 0);
      interview.overallScore = Math.round(totalOverall / interview.answers.length);
      
      // Determine confidence level
      if (interview.overallScore >= 80) {
        interview.confidenceLevel = 'High';
      } else if (interview.overallScore >= 50) {
        interview.confidenceLevel = 'Medium';
      } else {
        interview.confidenceLevel = 'Low';
      }
      
      // Collect strengths and weaknesses
      interview.strengths = [...new Set(interview.answers.flatMap(a => a.strengths))];
      interview.weaknesses = [...new Set(interview.answers.flatMap(a => a.weaknesses))];
      
      // Generate improvement tips
      interview.improvementTips = [
        'Focus on providing specific examples in your answers',
        'Practice explaining technical concepts clearly',
        'Work on answer structure and organization',
        'Review fundamental concepts in your domain'
      ];
    }
    
    interview.status = 'completed';
    await interview.save();
    
    res.json({
      message: 'Interview completed',
      results: {
        overallScore: interview.overallScore,
        technicalScore: interview.technicalScore,
        communicationScore: interview.communicationScore,
        confidenceLevel: interview.confidenceLevel,
        strengths: interview.strengths,
        weaknesses: interview.weaknesses,
        improvementTips: interview.improvementTips,
        answers: interview.answers
      }
    });
  } catch (error) {
    console.error('Finish interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/interview/:id - Get specific interview details
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    res.json(interview);
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
