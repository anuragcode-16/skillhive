import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import Searchbar from '../components/Searchbar';
import VideoCard from '../components/VideoCard';
import { updateCVWithLearningProgress, downloadCV } from '../api/cvManager';
import CVDownloadButton from '../components/CVDownloadButton';

// Mock courses data
const MOCK_COURSES = [
  {
    id: 1,
    title: "Complete JavaScript Course",
    description: "Master JavaScript from the basics to advanced concepts",
    thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "John Smith",
    duration: "12 hours",
    level: "Intermediate",
    category: "Programming",
    completionRate: 78,
    featured: true,
    skills: ["JavaScript", "ES6", "Web Development", "DOM Manipulation"],
    certification: {
      name: "JavaScript Developer Certification",
      issuer: "SkillHive Academy",
      id: "JS-DEV-2023"
    }
  },
  {
    id: 2,
    title: "UX/UI Design Fundamentals",
    description: "Learn the principles of user experience and interface design",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "Sarah Johnson",
    duration: "8 hours",
    level: "Beginner",
    category: "Design",
    completionRate: 92,
    skills: ["UI Design", "UX Design", "Wireframing", "User Research", "Prototyping"],
    certification: {
      name: "UI/UX Design Certification",
      issuer: "SkillHive Academy",
      id: "UIUX-2023"
    }
  },
  {
    id: 3,
    title: "Advanced Data Science with Python",
    description: "Deep dive into data analysis, machine learning, and AI",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "Michael Chen",
    duration: "16 hours",
    level: "Advanced",
    category: "Data Science",
    completionRate: 65,
    featured: true,
    skills: ["Python", "Data Analysis", "Machine Learning", "Statistics", "Data Visualization"],
    certification: {
      name: "Advanced Data Science Certification",
      issuer: "SkillHive Academy",
      id: "DS-ADV-2023"
    }
  },
  {
    id: 4,
    title: "Cloud Computing Essentials",
    description: "Understanding cloud infrastructure and deployment",
    thumbnail: "https://images.unsplash.com/photo-1508830524289-0adcbe822b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "Emma Thompson",
    duration: "10 hours",
    level: "Intermediate",
    category: "DevOps",
    completionRate: 81,
    skills: ["AWS", "Azure", "Cloud Architecture", "Deployment", "Scalability"],
    certification: null
  },
  {
    id: 5,
    title: "Digital Marketing Masterclass",
    description: "Learn effective strategies for online marketing and growth",
    thumbnail: "https://images.unsplash.com/photo-1432888622747-4eb9a8f5a8ee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "David Miller",
    duration: "14 hours",
    level: "Beginner",
    category: "Business",
    completionRate: 74,
    skills: ["SEO", "Social Media Marketing", "Content Strategy", "Email Marketing", "Analytics"],
    certification: {
      name: "Digital Marketing Professional",
      issuer: "SkillHive Academy",
      id: "DM-PRO-2023"
    }
  },
  {
    id: 6,
    title: "Mobile App Development with Flutter",
    description: "Build cross-platform mobile applications for iOS and Android",
    thumbnail: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "Amanda Wong",
    duration: "18 hours",
    level: "Intermediate",
    category: "Programming",
    completionRate: 68,
    skills: ["Flutter", "Dart", "Mobile Development", "UI Design", "App Publishing"],
    certification: {
      name: "Flutter Developer Certification",
      issuer: "SkillHive Academy",
      id: "FLUTTER-DEV-2023"
    }
  },
  {
    id: 7,
    title: "Blockchain Development Fundamentals",
    description: "Learn blockchain concepts, smart contracts, and decentralized applications",
    thumbnail: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "Robert Chen",
    duration: "15 hours",
    level: "Intermediate",
    category: "Programming",
    completionRate: 52,
    skills: ["Blockchain", "Smart Contracts", "Solidity", "Web3", "DApps"],
    certification: {
      name: "Blockchain Developer Certification",
      issuer: "SkillHive Academy",
      id: "BLOCK-DEV-2023"
    }
  },
  {
    id: 8,
    title: "Advanced Adobe Photoshop",
    description: "Master professional photo editing and digital art creation",
    thumbnail: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "Lisa Wang",
    duration: "20 hours",
    level: "Advanced",
    category: "Design",
    completionRate: 85,
    skills: ["Photo Editing", "Digital Art", "Color Correction", "Compositing", "Retouching"],
    certification: {
      name: "Adobe Photoshop Expert",
      issuer: "SkillHive Academy",
      id: "PS-EXP-2023"
    }
  },
  {
    id: 9,
    title: "Project Management Professional",
    description: "Learn effective project management methodologies and best practices",
    thumbnail: "https://images.unsplash.com/photo-1572177812156-58036aae439c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "James Wilson",
    duration: "16 hours",
    level: "Intermediate",
    category: "Business",
    completionRate: 76,
    skills: ["Project Planning", "Agile", "Risk Management", "Stakeholder Management", "Team Leadership"],
    certification: {
      name: "Project Management Professional",
      issuer: "SkillHive Academy",
      id: "PMP-2023"
    }
  },
  {
    id: 10,
    title: "Machine Learning with TensorFlow",
    description: "Build intelligent systems and advanced AI models",
    thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "Sophia Lee",
    duration: "25 hours",
    level: "Advanced",
    category: "Data Science",
    completionRate: 45,
    featured: true,
    skills: ["TensorFlow", "Neural Networks", "Deep Learning", "Computer Vision", "Natural Language Processing"],
    certification: {
      name: "Machine Learning Engineer",
      issuer: "SkillHive Academy",
      id: "ML-ENG-2023"
    }
  },
  {
    id: 11,
    title: "Kubernetes for DevOps Engineers",
    description: "Master container orchestration for scalable applications",
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "Thomas Anderson",
    duration: "18 hours",
    level: "Advanced",
    category: "DevOps",
    completionRate: 38,
    skills: ["Kubernetes", "Docker", "Container Orchestration", "Microservices", "CI/CD"],
    certification: {
      name: "Certified Kubernetes Administrator",
      issuer: "SkillHive Academy",
      id: "CKA-2023"
    }
  },
  {
    id: 12,
    title: "Front-End Web Development Bootcamp",
    description: "Build responsive and modern websites with HTML, CSS and JavaScript",
    thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructor: "Emily Rodriguez",
    duration: "30 hours",
    level: "Beginner",
    category: "Programming",
    completionRate: 90,
    skills: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Web Accessibility"],
    certification: {
      name: "Front-End Developer Certification",
      issuer: "SkillHive Academy",
      id: "FE-DEV-2023"
    }
  }
];

const Learning = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Programming', 'Design', 'Data Science', 'DevOps', 'Business'];

  // Load user progress from localStorage
  useEffect(() => {
    if (currentUser) {
      try {
        const savedProgress = localStorage.getItem(`courseProgress_${currentUser.uid}`);
        if (savedProgress) {
          setUserProgress(JSON.parse(savedProgress));
        }
      } catch (err) {
        console.error('Error loading course progress:', err);
      }
    }
    setLoading(false);
  }, [currentUser]);
  
  // Filter courses based on search term and category
  useEffect(() => {
    let filtered = courses;
    
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    
    setFilteredCourses(filtered);
  }, [searchTerm, courses, selectedCategory]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  const markCourseAsCompleted = async (courseId) => {
    if (!currentUser) return;
    
    try {
      // Find the course data
      const course = courses.find(c => c.id === courseId);
      if (!course) return;
      
      // Update user progress
      const updatedProgress = {
        ...userProgress,
        [courseId]: {
          completed: true,
          completedAt: new Date().toISOString(),
          courseData: course
        }
      };
      
      setUserProgress(updatedProgress);
      localStorage.setItem(`courseProgress_${currentUser.uid}`, JSON.stringify(updatedProgress));
      
      // Update the user's CV with new skills from the course
      const result = await updateCVWithLearningProgress(currentUser.uid, course);
      
      // Show success message
      setSuccessMessage(`Congratulations! You completed "${course.title}" and your CV has been updated with new skills.`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch (err) {
      console.error('Error marking course as completed:', err);
      setError('Failed to update your progress. Please try again.');
    }
  };
  
  const isCourseCompleted = (courseId) => {
    return userProgress[courseId]?.completed || false;
  };
  
  const getCompletedCourseCount = () => {
    return Object.values(userProgress).filter(progress => progress.completed).length;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-xl shadow-lg p-6 md:p-10 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Learning Center</h1>
              <p className="text-blue-100 text-lg mb-6">Enhance your skills with our expert-led courses</p>
              
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  {Object.keys(MOCK_COURSES).length} Total Courses
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  {categories.length - 1} Categories
                </div>
                
                {currentUser && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {getCompletedCourseCount()} Completed
                  </div>
                )}
              </div>
            </div>
            
            {showSuccessMessage && (
              <div className="mt-4 p-6 bg-green-100 text-green-800 rounded-lg border border-green-200 shadow-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-green-800">Course completed!</h3>
                    <div className="mt-2 text-green-700">
                      {successMessage}
                    </div>
                    <div className="mt-4">
                      <CVDownloadButton 
                        userId={currentUser?.uid}
                        userName={currentUser?.displayName}
                        buttonText="Download Your Updated CV"
                        className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Browse by Category</h3>
              <div className="flex overflow-x-auto pb-2 gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category === 'All' && (
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    )}
                    {category === 'Programming' && (
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                    {category === 'Design' && (
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    )}
                    {category === 'Data Science' && (
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                      </svg>
                    )}
                    {category === 'DevOps' && (
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    )}
                    {category === 'Business' && (
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    )}
                    {category}
                    {selectedCategory === category && (
                      <span className="ml-1.5 flex items-center justify-center bg-white bg-opacity-30 rounded-full h-5 w-5 text-xs">
                        {filteredCourses.filter(c => category === 'All' || c.category === category).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <Searchbar 
                onSearch={handleSearch} 
                placeholder="Search courses..." 
                className="shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* User Progress Summary */}
              {currentUser && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Your Learning Journey</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="font-medium text-blue-800">Completed Courses</div>
                      <div className="text-3xl font-bold text-blue-600 mt-2">{getCompletedCourseCount()}</div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="font-medium text-green-800">Skills Acquired</div>
                      <div className="text-3xl font-bold text-green-600 mt-2">
                        {Array.from(new Set(
                          Object.values(userProgress)
                            .filter(progress => progress.completed)
                            .flatMap(progress => progress.courseData.skills)
                        )).length}
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="font-medium text-purple-800">CV Status</div>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-purple-600 mr-3">Download your updated CV</span>
                        <CVDownloadButton 
                          userId={currentUser.uid}
                          userName={currentUser.displayName}
                          buttonText="Download"
                          className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Courses List */}
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No courses found matching your criteria.</p>
                </div>
              ) : (
                <>
                  {/* Featured Courses Section - Only show when not searching or filtering */}
                  {(!searchTerm && selectedCategory === 'All') && (
                    <div className="mb-12">
                      <div className="flex items-center mb-6">
                        <svg className="w-6 h-6 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900">Featured Courses</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {filteredCourses.filter(course => course.featured).map(course => (
                          <div key={course.id} className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-md overflow-hidden ring-2 ring-yellow-400 hover:shadow-xl transition-all">
                            <div className="h-52 overflow-hidden relative">
                              <img 
                                src={course.thumbnail} 
                                alt={course.title} 
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-0 right-0 m-2 flex flex-col gap-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                                  course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {course.level}
                                </span>
                              </div>
                              <div className="absolute top-0 left-0 w-28 h-28 overflow-hidden">
                                <div className="absolute top-5 left-[-35px] transform rotate-[-45deg] bg-yellow-500 text-white text-xs font-bold py-1 w-36 text-center">
                                  FEATURED
                                </div>
                              </div>
                            </div>
                            <div className="p-6">
                              <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{course.title}</h3>
                              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {course.skills.slice(0, 3).map((skill, idx) => (
                                  <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                                    {skill}
                                  </span>
                                ))}
                                {course.skills.length > 3 && (
                                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    +{course.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center text-sm text-gray-500">
                                  <span className="font-medium">{course.instructor}</span>
                                </div>
                                <button 
                                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:shadow-lg transition-all transform hover:scale-105"
                                  onClick={() => !isCourseCompleted(course.id) && markCourseAsCompleted(course.id)}
                                >
                                  {isCourseCompleted(course.id) ? 'Completed' : 'Enroll Now'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* All Courses */}
                  <div className={`${(!searchTerm && selectedCategory === 'All') ? 'mb-8' : ''}`}>
                    {(searchTerm || selectedCategory !== 'All') && (
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {searchTerm ? 'Search Results' : `${selectedCategory} Courses`}
                      </h2>
                    )}
                    {(!searchTerm && selectedCategory === 'All') && (
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">All Courses</h2>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCourses.map(course => (
                        <div key={course.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${course.featured ? 'ring-2 ring-yellow-400 hover:shadow-xl' : 'hover:shadow-lg'} transition-all`}>
                          <div className="h-52 overflow-hidden relative">
                            <img 
                              src={course.thumbnail} 
                              alt={course.title} 
                              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-0 right-0 m-2 flex flex-col gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                                course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {course.level}
                              </span>
                              {course.featured && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                                  <svg className="w-3 h-3 mr-1 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  Featured
                                </span>
                              )}
                            </div>
                            {course.featured && (
                              <div className="absolute top-0 left-0 w-28 h-28 overflow-hidden">
                                <div className="absolute top-5 left-[-35px] transform rotate-[-45deg] bg-yellow-500 text-white text-xs font-bold py-1 w-36 text-center">
                                  FEATURED
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{course.title}</h3>
                            <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {course.skills.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                                  {skill}
                                </span>
                              ))}
                              {course.skills.length > 3 && (
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                  +{course.skills.length - 3} more
                                </span>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-center text-sm text-gray-500 mb-4 pt-2 border-t">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                </svg>
                                {course.instructor}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                                </svg>
                                {course.duration}
                              </div>
                            </div>
                            
                            {isCourseCompleted(course.id) ? (
                              <div className="flex justify-between items-center">
                                <span className="text-green-600 font-medium flex items-center">
                                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Completed
                                </span>
                                <button 
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                  onClick={() => window.location.href = `#/course/${course.id}`}
                                >
                                  Review Course
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${course.completionRate || 0}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">{course.completionRate}% complete</span>
                                  <button 
                                    className={`${course.featured ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-blue-600'} text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors transform hover:scale-105`}
                                    onClick={() => markCourseAsCompleted(course.id)}
                                  >
                                    Complete Course
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* Videos from YouTube */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Learning Resources</h2>
                <VideoCard topics={searchTerm || selectedCategory !== 'All' ? selectedCategory : 'programming'} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Learning;