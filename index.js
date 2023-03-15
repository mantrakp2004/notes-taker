const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { processTopics } = require('./backend_topics');
const { processCaptions } = require('./backend_captions');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();

// Set up session middleware
app.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 } // 30 minutes
}));

app.use(express.static(path.join(__dirname, 'templates')));

app.use('/css', express.static(path.join(__dirname, 'templates', 'css'), { 
  type: 'text/css' 
}));


// Set up body-parser middleware
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Set the views directory
app.set('views', path.join(__dirname, 'templates'));


// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve index.html file
app.get('/', (req, res) => {
  res.render('index');
});

// Handle form submission
app.post('/', async  (req, res) => {
  const htmlContent = req.body.html;


  // Create session directory if it doesn't exist
  const sessionId = req.session.id;
  const sessionDir = path.join(__dirname, 'output_logs', sessionId);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir);
  }

  // Run backend_topics.js and store the output in 'topics.txt'
  const topicsOutput = processTopics(htmlContent);
  const topicsFilePath = path.join(sessionDir, 'topics.txt');
  fs.writeFileSync(topicsFilePath, topicsOutput, 'utf-8');

  // Run backend_captions.js and store the output in 'captions.txt'
  const captionsOutput = processCaptions(htmlContent);
  const captionsFilePath = path.join(sessionDir, 'captions.txt');
  fs.writeFileSync(captionsFilePath, captionsOutput, 'utf-8');

  // Copy summarizer.py to the session directory
  const summarizerFilePath = path.join(__dirname, 'summarizer.py');
  const summarizerSessionFilePath = path.join(sessionDir, 'summarizer.py');
  fs.copyFileSync(summarizerFilePath, summarizerSessionFilePath);

  // Generate summary using summarizer.py
  const pythonScript = `python3 "${summarizerSessionFilePath}" "${captionsFilePath}" "${sessionDir}"`;
  exec(pythonScript, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
  });

  // Check if summary.txt exists before copying the output.html file
    const summaryFilePath = path.join(sessionDir, 'summary.txt');
    while (!fs.existsSync(summaryFilePath)) {
        await new Promise(r => setTimeout(r, 1000));
    }
    
  // Copy the output.html file to the session directory
  const outputFilePath = path.join(__dirname, 'output.html');
  const sessionFilePath = path.join(sessionDir, 'output.html');
  fs.copyFileSync(outputFilePath, sessionFilePath);

  // Set session variable
  req.session.sessionDir = sessionDir;

  res.redirect('/output');
});

// Serve sessionid/output.html file
app.get('/output', (req, res) => {
  // Read the HTML content from the session directory
  const sessionDir = req.session.sessionDir;
  const filePath = path.join(sessionDir, 'output.html');
  const htmlContent = fs.readFileSync(filePath, 'utf-8');
  app.use(express.static(path.join(sessionDir)));

  // Send HTML response
  res.send(htmlContent);
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
