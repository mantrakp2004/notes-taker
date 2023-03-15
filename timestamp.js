const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

function processTopics(htmlContent) {
  // Parse HTML content using Cheerio
  const $ = cheerio.load(htmlContent);

  // Remove all script and style elements
  $('script, style').remove();

  // Break into lines and remove leading and trailing space on each
  let lines = $('body').text().split('\n').map(line => line.trim());

  // Break multi-headlines into a line each
  let chunks = lines.map(line => line.split(/\s{2,}/)).flat();

  // Drop blank lines
  lines = lines.filter(line => line !== '');

  // Remove all text above "Type a keyword and hit Enter to search"
  const startIndex = lines.findIndex(line => line.includes('Type a keyword and hit Enter to search'));
  if (startIndex !== -1) {
    lines = lines.slice(startIndex);
  }

  // Remove all text below "English (United States)"
  const endIndex = lines.findIndex(line => line.includes('English (United States)'));
  if (endIndex !== -1) {
    lines = lines.slice(0, endIndex + 1);
  }
  // Remove the first three lines from the file
    lines = lines.slice(3);
    
  // Remove 3 lines and keep the 4th one, repeat this until the end of the file
  let outputLines = [];
  for (let i = 0; i < lines.length; i += 4) {
    if (i + 3 < lines.length) {
      outputLines.push(lines[i + 3]);
    }
  }

  // Remove the last two lines from the file
  outputLines = outputLines.slice(0, outputLines.length - 2);

  // make the htmlOutput & return it
  const htmlOutput = outputLines.join('\n');

  return htmlOutput;
}

module.exports = {
  processTopics
};