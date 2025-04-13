import axios from 'axios';

// Utility function for local storage
const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// In a real app, these would be API calls to the backend
export const getUserCV = async (userId) => {
  try {
    // For demo purposes, we'll use localStorage
    const storedCVs = getFromLocalStorage('userCVs') || {};
    
    // If we don't have a CV for this user yet, return a default template
    if (!storedCVs[userId]) {
      return {
        userId,
        personal: {
          name: '',
          email: '',
          phone: '',
          location: '',
          website: '',
          summary: ''
        },
        skills: [],
        education: [],
        experience: [],
        certifications: [],
        lastUpdated: new Date().toISOString()
      };
    }
    
    return storedCVs[userId];
  } catch (error) {
    console.error('Error fetching user CV:', error);
    throw error;
  }
};

export const updateUserCV = async (userId, cvData) => {
  try {
    // In a real app, this would be an API call
    // For demo purposes, we'll use localStorage
    const storedCVs = getFromLocalStorage('userCVs') || {};
    
    // Update the CV with new data
    storedCVs[userId] = {
      ...cvData,
      lastUpdated: new Date().toISOString()
    };
    
    // Save back to localStorage
    saveToLocalStorage('userCVs', storedCVs);
    
    // Track CV updates for admin stats
    const cvStats = getFromLocalStorage('cvStats') || {
      pendingUpdates: 0,
      updatedThisMonth: 0,
      totalDownloads: 0,
      updatesHistory: []
    };
    
    cvStats.updatedThisMonth += 1;
    cvStats.updatesHistory.push({
      userId,
      timestamp: new Date().toISOString(),
      type: 'automatic'
    });
    
    saveToLocalStorage('cvStats', cvStats);
    
    return storedCVs[userId];
  } catch (error) {
    console.error('Error updating user CV:', error);
    throw error;
  }
};

export const updateCVWithLearningProgress = async (userId, courseData) => {
  try {
    // Get the current CV
    const userCV = await getUserCV(userId);
    
    // Update the skills based on course completion
    const updatedSkills = [...userCV.skills];
    
    // Add new skills from the course if they don't already exist
    courseData.skills.forEach(skill => {
      const existingSkill = updatedSkills.find(s => s.name.toLowerCase() === skill.toLowerCase());
      
      if (!existingSkill) {
        updatedSkills.push({
          name: skill,
          level: 'Beginner',
          source: `${courseData.title} course`
        });
      } else {
        // Upgrade skill level based on course difficulty
        if (courseData.level === 'Advanced' && existingSkill.level !== 'Expert') {
          existingSkill.level = 'Advanced';
        } else if (courseData.level === 'Intermediate' && existingSkill.level === 'Beginner') {
          existingSkill.level = 'Intermediate';
        }
      }
    });
    
    // Add certification if it's a certification course
    let updatedCertifications = [...userCV.certifications];
    if (courseData.certification) {
      updatedCertifications.push({
        name: courseData.certification.name,
        issuer: courseData.certification.issuer || 'SkillHive',
        date: new Date().toISOString().split('T')[0],
        id: courseData.certification.id || `CERT-${Date.now()}`
      });
    }
    
    // Update the CV with new data
    const updatedCV = {
      ...userCV,
      skills: updatedSkills,
      certifications: updatedCertifications,
      lastUpdated: new Date().toISOString()
    };
    
    // Save the updated CV
    return await updateUserCV(userId, updatedCV);
  } catch (error) {
    console.error('Error updating CV with learning progress:', error);
    throw error;
  }
};

export const downloadCV = async (userId, format = 'pdf') => {
  try {
    // In a real app, this would call a backend service to generate PDF
    const userCV = await getUserCV(userId);
    
    // Track the download in stats
    const cvStats = getFromLocalStorage('cvStats') || {
      pendingUpdates: 0,
      updatedThisMonth: 0,
      totalDownloads: 0,
      downloadsHistory: []
    };
    
    cvStats.totalDownloads += 1;
    cvStats.downloadsHistory = cvStats.downloadsHistory || [];
    cvStats.downloadsHistory.push({
      userId,
      timestamp: new Date().toISOString(),
      format
    });
    
    saveToLocalStorage('cvStats', cvStats);
    
    // In a real app, this would return a download URL or blob
    // For demo purposes, we're just returning the CV data
    return {
      success: true,
      message: `CV downloaded in ${format.toUpperCase()} format`,
      data: userCV
    };
  } catch (error) {
    console.error('Error downloading CV:', error);
    throw error;
  }
};

export const getAdminCVStats = async () => {
  try {
    // In a real app, this would be an API call to get stats from backend
    const cvStats = getFromLocalStorage('cvStats') || {
      pendingUpdates: 78, // Default values for demo
      updatedThisMonth: 152,
      totalDownloads: 267,
      updatesHistory: [],
      downloadsHistory: []
    };
    
    return cvStats;
  } catch (error) {
    console.error('Error fetching CV stats:', error);
    throw error;
  }
};

export const processPendingCVUpdates = async () => {
  try {
    // In a real app, this would process a queue of pending CV updates
    const cvStats = getFromLocalStorage('cvStats') || {
      pendingUpdates: 78,
      updatedThisMonth: 152,
      totalDownloads: 267
    };
    
    // Simulate processing
    const processed = Math.min(cvStats.pendingUpdates, 25); // Process up to 25 at a time
    
    cvStats.pendingUpdates -= processed;
    cvStats.updatedThisMonth += processed;
    
    saveToLocalStorage('cvStats', cvStats);
    
    return {
      success: true,
      processed,
      remaining: cvStats.pendingUpdates
    };
  } catch (error) {
    console.error('Error processing pending CV updates:', error);
    throw error;
  }
}; 