import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import CVDownloadButton from './CVDownloadButton';

const UserStatsModal = ({ isOpen, onClose, userId, userName }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isOpen || !userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call
        // For demo, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        // Get course progress from localStorage if available
        const savedProgress = localStorage.getItem(`courseProgress_${userId}`);
        const courseProgress = savedProgress ? JSON.parse(savedProgress) : {};
        
        // Generate mock data based on real progress if available
        const completedCourses = Object.values(courseProgress).filter(c => c.completed).length;
        
        const mockUserData = {
          userId,
          name: userName || 'User',
          email: `${userId}@example.com`,
          registrationDate: '2023-01-15',
          lastActive: new Date().toISOString().split('T')[0],
          courses: {
            total: Math.max(completedCourses + Math.floor(Math.random() * 5), 4),
            completed: completedCourses || Math.floor(Math.random() * 3) + 1,
            inProgress: Math.floor(Math.random() * 3)
          },
          quizzes: {
            total: Math.floor(Math.random() * 15) + 5,
            avgScore: Math.floor(Math.random() * 30) + 70
          },
          skills: [
            { name: 'JavaScript', level: 'Advanced', source: 'Completed Course' },
            { name: 'React', level: 'Intermediate', source: 'Completed Course' },
            { name: 'HTML/CSS', level: 'Advanced', source: 'Completed Course' },
            { name: 'Node.js', level: 'Beginner', source: 'In Progress' },
            { name: 'Python', level: 'Intermediate', source: 'Completed Course' }
          ],
          interests: ['Web Development', 'Mobile Apps', 'Data Science'],
          certifications: [
            { name: 'JavaScript Developer', issuer: 'SkillHive Academy', date: '2023-03-10' },
            { name: 'React Specialist', issuer: 'SkillHive Academy', date: '2023-05-22' }
          ],
          cvStatus: {
            lastUpdated: '2023-09-15',
            pendingUpdates: Math.random() > 0.5
          }
        };
        
        setUserData(mockUserData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [isOpen, userId, userName]);
  
  if (!isOpen) return null;
  
  // Chart data for course completion
  const courseChartData = userData ? {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [
          userData.courses.completed,
          userData.courses.inProgress,
          userData.courses.total - userData.courses.completed - userData.courses.inProgress
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(201, 203, 207, 0.6)'
        ],
        borderWidth: 1
      }
    ]
  } : null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pr-8">User Details</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-lg text-gray-600">Loading user data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-600">
              {error}
            </div>
          ) : userData ? (
            <div className="space-y-8">
              {/* User Info */}
              <div className="flex flex-col md:flex-row border-b pb-6">
                <div className="md:w-1/4 mb-4 md:mb-0">
                  <div className="flex items-center justify-center md:justify-start">
                    <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {userData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{userData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{userData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registered</p>
                    <p className="font-medium">{userData.registrationDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Active</p>
                    <p className="font-medium">{userData.lastActive}</p>
                  </div>
                </div>
              </div>
              
              {/* Learning Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-700 mb-4">Course Progress</h3>
                  <div className="h-48 flex items-center justify-center">
                    {courseChartData && (
                      <Pie 
                        data={courseChartData} 
                        options={{ 
                          plugins: { legend: { position: 'bottom' } },
                          responsive: true,
                          maintainAspectRatio: false
                        }} 
                      />
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">Completion Rate</p>
                    <p className="text-xl font-bold text-blue-600">
                      {Math.round((userData.courses.completed / userData.courses.total) * 100)}%
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-700 mb-4">Quiz Performance</h3>
                  <div className="py-4 text-center">
                    <div className="inline-block rounded-full h-32 w-32 bg-green-50 p-2">
                      <div className="h-full w-full rounded-full bg-white border-8 border-green-400 flex items-center justify-center">
                        <div>
                          <div className="text-2xl font-bold text-green-600">{userData.quizzes.avgScore}%</div>
                          <div className="text-xs text-gray-500">Avg. Score</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Total Quizzes Taken</p>
                      <p className="text-xl font-bold text-gray-700">{userData.quizzes.total}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-700 mb-4">CV Status</h3>
                  <div className="flex flex-col items-center justify-center h-48">
                    <div className={`text-lg font-medium mb-2 ${userData.cvStatus.pendingUpdates ? 'text-orange-500' : 'text-green-500'}`}>
                      {userData.cvStatus.pendingUpdates ? 'Updates Pending' : 'Up to Date'}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Last Updated: {userData.cvStatus.lastUpdated}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        onClick={() => {
                          // In a real app, this would process CV updates
                          alert('CV updated with latest skills and certifications');
                        }}
                      >
                        Update CV
                      </button>
                      
                      <CVDownloadButton 
                        userId={userId}
                        userName={userData.name}
                        buttonText="Download CV"
                        className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Skills & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-700 mb-4">Skills</h3>
                  <div className="space-y-3">
                    {userData.skills.map((skill, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-xs text-gray-500">{skill.source}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          skill.level === 'Beginner' ? 'bg-blue-100 text-blue-800' :
                          skill.level === 'Intermediate' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {skill.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-700 mb-4">Certifications</h3>
                  {userData.certifications.length > 0 ? (
                    <div className="space-y-4">
                      {userData.certifications.map((cert, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                          <p className="font-medium">{cert.name}</p>
                          <div className="flex justify-between text-sm">
                            <p className="text-gray-600">{cert.issuer}</p>
                            <p className="text-gray-500">{cert.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No certifications yet</p>
                  )}
                </div>
              </div>
              
              {/* Interests & Notes */}
              <div className="border-t pt-6">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.map((interest, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Admin Notes</h3>
                  <textarea 
                    className="w-full border rounded-md p-2 text-sm"
                    rows={3}
                    placeholder="Add notes about this user..."
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300">
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserStatsModal; 