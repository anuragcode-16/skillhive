import { GEMINI_API_KEY } from '../config';
import axios from 'axios';

export async function generateMCQs(query) {
  try {
    const data = JSON.stringify({
      "contents": [
        {
          "parts": [
            {
              "text": `Generate 5 multiple choice questions about ${query}. Each question should have 4 options (A, B, C, D) and indicate the correct answer. Format the response as a JSON array of objects, where each object has properties: "question", "options" (array of 4 strings), and "correctAnswer" (index 1-4 representing A, B, C, or D).`
            }
          ]
        }
      ]
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    const response = await axios.request(config);
    const candidates = response.data.candidates;
    
    if (candidates && candidates.length > 0) {
      const rawText = candidates[0].content.parts.map(part => part.text).join('');
      let cleanedText = rawText
        .replace(/```json\n/g, '') 
        .replace(/\n```/g, '')
        .replace(/```.*\n/g, '')
        .replace(/(\*\*|__|~~|`|[\*\_\~])/g, '')
        .trim();
      cleanedText = cleanedText.replace(/#.*\n/g, '');
      return cleanedText;
    } else {
      console.log("No candidates generated.");
      return [];
    }
  } catch (error) {
    console.error('Error while generating MCQ questions:', error.response?.data || error.message);
    return [];
  }
}

export async function generateCVBasedQuizzes(profile, requiredSkills = []) {
  try {
    // Extract skills from profile
    const profileSkills = [...profile.skills, ...profile.technical_skills];
    
    // Combine all skills and remove duplicates
    const allSkills = [...new Set([...profileSkills, ...requiredSkills])];
    
    // Filter to relevant technical topics (max 5)
    const relevantTopics = allSkills
      .filter(skill => {
        // Focus on technical skills that can be quizzed
        const lowerSkill = skill.toLowerCase();
        return ['javascript', 'react', 'python', 'node', 'java', 'cloud', 'database', 
                'blockchain', 'web', 'mobile', 'css', 'html', 'typescript', 'angular',
                'vue', 'ui', 'ux', 'design', 'api', 'testing', 'devops', 'security'].some(
                  tech => lowerSkill.includes(tech)
                );
      })
      .slice(0, 5); // Limit to 5 topics
    
    if (relevantTopics.length === 0) {
      console.log("No relevant technical topics found in profile.");
      // Default to some common topics if none detected
      relevantTopics.push('Web Development', 'JavaScript', 'Software Engineering');
    }
    
    console.log('Generating quiz for topics:', relevantTopics);
    
    // Create a prompt that takes the skills and experience from the CV to generate relevant questions
    const prompt = `
      I have a candidate with the following profile:
      
      Skills: ${profile.skills.join(', ')}
      Technical Skills: ${profile.technical_skills.join(', ')}
      Experience: ${profile.experience.map(exp => `${exp.title} at ${exp.company}`).join(', ')}
      
      Based on this profile, generate a quiz with 3-5 multiple choice questions for EACH of these topics: ${relevantTopics.join(', ')}
      
      Each question should:
      1. Be relevant to the candidate's background and skill level
      2. Test both fundamental and advanced concepts
      3. Have 4 options (labeled 1, 2, 3, 4)
      4. Include the correct answer (as a number 1-4)
      
      Format the response as a JSON object where keys are topic names and values are arrays of question objects.
      Each question object should have properties: "question", "options" (array of 4 strings), and "correctAnswer" (number 1-4).
      
      Example format:
      {
        "JavaScript": [
          {
            "question": "What is closure in JavaScript?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": 2
          },
          {...}
        ],
        "React": [...]
      }
    `;
    
    const data = JSON.stringify({
      "contents": [
        {
          "parts": [
            {
              "text": prompt
            }
          ]
        }
      ]
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    const response = await axios.request(config);
    const candidates = response.data.candidates;
    
    if (candidates && candidates.length > 0) {
      const rawText = candidates[0].content.parts.map(part => part.text).join('');
      let cleanedText = rawText
        .replace(/```json\n/g, '') 
        .replace(/\n```/g, '')
        .replace(/```.*\n/g, '')
        .trim();
      
      // Try to parse the JSON from the response
      try {
        const parsedQuizzes = JSON.parse(cleanedText);
        return parsedQuizzes;
      } catch (parseError) {
        console.error('Error parsing quiz JSON:', parseError);
        throw new Error('Failed to parse quiz data from API response');
      }
    } else {
      console.log("No candidates generated for CV-based quiz.");
      throw new Error('No quiz questions were generated');
    }
  } catch (error) {
    console.error('Error while generating CV-based quiz:', error.response?.data || error.message);
    throw error;
  }
} 