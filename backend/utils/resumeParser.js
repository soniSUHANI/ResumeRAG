const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

class ResumeParser {
  constructor() {
    this.skillKeywords = [
      'python', 'javascript', 'java', 'react', 'node', 'sql', 'mongodb',
      'aws', 'docker', 'kubernetes', 'machine learning', 'ai', 'html',
      'css', 'typescript', 'angular', 'vue', 'django', 'flask', 'spring',
      'git', 'jenkins', 'terraform', 'ansible'
    ];
  }

  async parseResume(filePath) {
    try {
      const fileExtension = path.extname(filePath).toLowerCase();
      let text = '';

      if (fileExtension === '.pdf') {
        text = await this.extractTextFromPDF(filePath);
      } else if (fileExtension === '.txt') {
        text = await this.extractTextFromTxt(filePath);
      } else {
        throw new Error('Unsupported file type. Please upload PDF or TXT files.');
      }

      return this.parseText(text);
    } catch (error) {
      throw new Error(`Error parsing resume: ${error.message}`);
    }
  }

  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF parsing error: ${error.message}`);
    }
  }

  extractTextFromTxt(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error(`TXT reading error: ${error.message}`);
    }
  }

  parseText(text) {
    const parsedData = {
      name: this.extractName(text),
      email: this.extractEmail(text),
      phone: this.extractPhone(text),
      skills: this.extractSkills(text),
      experience: this.extractExperience(text),
      education: this.extractEducation(text),
      rawText: text.substring(0, 5000) // Limit text size
    };

    return parsedData;
  }

  extractName(text) {
    // Simple name extraction - first line with reasonable length
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    for (let line of lines.slice(0, 5)) {
      if (line.length > 2 && line.length < 50 && !line.includes('@') && !this.isDate(line)) {
        return line;
      }
    }
    return 'Unknown';
  }

  extractEmail(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0] : '';
  }

  extractPhone(text) {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const match = text.match(phoneRegex);
    return match ? match[0] : '';
  }

  extractSkills(text) {
    const foundSkills = [];
    const textLower = text.toLowerCase();
    
    this.skillKeywords.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });
    
    return [...new Set(foundSkills)]; // Remove duplicates
  }

  extractExperience(text) {
    const experience = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('experience') || line.includes('work') || line.includes('employment')) {
        // Take next few lines as experience context
        for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
          const expLine = lines[j].trim();
          if (expLine && expLine.length > 10) {
            experience.push({
              title: this.extractJobTitle(expLine),
              company: this.extractCompany(expLine),
              duration: '',
              description: expLine.substring(0, 200)
            });
            if (experience.length >= 3) break;
          }
        }
        break;
      }
    }
    
    return experience;
  }

  extractJobTitle(line) {
    const titles = ['developer', 'engineer', 'manager', 'analyst', 'specialist', 'consultant'];
    const words = line.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (titles.includes(words[i].toLowerCase()) && i > 0) {
        return words.slice(Math.max(0, i - 1), Math.min(words.length, i + 2)).join(' ');
      }
    }
    return line.split('-')[0] || line.split(' at ')[0] || 'Position';
  }

  extractCompany(line) {
    if (line.includes(' at ')) {
      return line.split(' at ')[1].split(',')[0];
    } else if (line.includes(' - ')) {
      const parts = line.split(' - ');
      return parts.length > 1 ? parts[1] : 'Unknown';
    }
    return 'Unknown';
  }

  extractEducation(text) {
    const education = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('education') || line.includes('university') || line.includes('college') || line.includes('degree')) {
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const eduLine = lines[j].trim();
          if (eduLine && eduLine.length > 5) {
            education.push({
              degree: this.extractDegree(eduLine),
              institution: eduLine,
              year: this.extractYear(eduLine)
            });
            if (education.length >= 2) break;
          }
        }
        break;
      }
    }
    
    return education;
  }

  extractDegree(line) {
    const degrees = ['bachelor', 'master', 'phd', 'associate', 'diploma'];
    for (const degree of degrees) {
      if (line.toLowerCase().includes(degree)) {
        return degree.charAt(0).toUpperCase() + degree.slice(1);
      }
    }
    return 'Degree';
  }

  extractYear(line) {
    const yearRegex = /\b(19|20)\d{2}\b/;
    const match = line.match(yearRegex);
    return match ? match[0] : '';
  }

  isDate(text) {
    return /\b(19|20)\d{2}\b/.test(text) || 
           /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(text);
  }
}

module.exports = new ResumeParser();