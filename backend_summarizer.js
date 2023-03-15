const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the session ID from the command line argument
const sessionId = process.argv[2];

// Define the paths to the input and output files
const inputFilePath = path.join(__dirname, `../output_log/${sessionId}/captions.txt`);
const outputFilePath = path.join(__dirname, `../output_log/${sessionId}/summary.txt`);

// Check if the input file exists
if (!fs.existsSync(inputFilePath)) {
  console.error(`Input file not found: ${inputFilePath}`);
  return;
}

// Run the Python script to generate the summary
exec(`python summarizer.py ${inputFilePath} ${outputFilePath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});