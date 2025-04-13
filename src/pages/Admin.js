import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { 
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Mock data - would be replaced with actual API calls
const MOCK_USER_DATA = {
  totalUsers: 1254,
  activeThisMonth: 876,
  newThisMonth: 143,
  completionRate: 68
};

const MOCK_COURSE_POPULARITY = {
  labels: ['Web Development', 'Data Science', 'JavaScript', 'Python', 'UI/UX Design', 'Cloud Computing', 'DevOps'],
  data: [423, 389, 328, 289, 223, 178, 98]
};

const MOCK_SKILL_DISTRIBUTION = {
  labels: ['Programming', 'Design', 'Data Analysis', 'Project Management', 'Marketing', 'Communication', 'Leadership'],
  data: [34, 22, 18, 12, 8, 4, 2]
};

const MOCK_USER_PROGRESS_DATA = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  completedCourses: [65, 78, 82, 95, 110, 125, 140, 160, 185, 202, 218, 240],
  activeUsers: [320, 350, 410, 450, 480, 520, 580, 630, 720, 800, 950, 1150],
  quizAttempts: [180, 210, 250, 290, 310, 360, 390, 420, 480, 520, 580, 650]
};

const MOCK_USER_PROFILES = [
  { id: 1, name: "Emma Johnson", email: "emma@example.com", courses: 5, quizzes: 12, level: "Intermediate", lastActive: "2023-09-15" },
  { id: 2, name: "James Smith", email: "james@example.com", courses: 3, quizzes: 8, level: "Beginner", lastActive: "2023-09-18" },
  { id: 3, name: "Sophia Williams", email: "sophia@example.com", courses: 8, quizzes: 20, level: "Advanced", lastActive: "2023-09-20" },
  { id: 4, name: "Noah Brown", email: "noah@example.com", courses: 4, quizzes: 10, level: "Intermediate", lastActive: "2023-09-16" },
  { id: 5, name: "Olivia Garcia", email: "olivia@example.com", courses: 7, quizzes: 18, level: "Advanced", lastActive: "2023-09-19" }
];

const Admin = () => {
  const { currentUser } = useAuth();
  const [userStats, setUserStats] = useState(MOCK_USER_DATA);
  const [coursePopularity, setCoursePopularity] = useState(MOCK_COURSE_POPULARITY);
  const [skillDistribution, setSkillDistribution] = useState(MOCK_SKILL_DISTRIBUTION);
  const [userProgress, setUserProgress] = useState(MOCK_USER_PROGRESS_DATA);
  const [userProfiles, setUserProfiles] = useState(MOCK_USER_PROFILES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Add state for searching users
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState(userProfiles);
  
  // Add state for CV update features
  const [cvUpdates, setCvUpdates] = useState({
    pendingUpdates: 78,
    updatedThisMonth: 152,
    totalDownloads: 267
  });

  useEffect(() => {
    // Filter profiles based on search term
    setFilteredProfiles(
      userProfiles.filter(profile => 
        profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.level.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, userProfiles]);

  // In a real app, this would fetch data from an API
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Here we would make API calls to get real data
        // For now we'll use the mock data loaded above
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setUserStats(MOCK_USER_DATA);
        setCoursePopularity(MOCK_COURSE_POPULARITY);
        setSkillDistribution(MOCK_SKILL_DISTRIBUTION);
        setUserProgress(MOCK_USER_PROGRESS_DATA);
        setUserProfiles(MOCK_USER_PROFILES);
        
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);
  
  // Process data for charts
  const courseData = {
    labels: coursePopularity.labels,
    datasets: [
      {
        label: 'Number of Users',
        data: coursePopularity.data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      }
    ]
  };
  
  const skillData = {
    labels: skillDistribution.labels,
    datasets: [
      {
        label: 'Skill Distribution (%)',
        data: skillDistribution.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
        ],
        borderWidth: 1,
      }
    ]
  };
  
  const progressData = {
    labels: userProgress.labels,
    datasets: [
      {
        label: 'Completed Courses',
        data: userProgress.completedCourses,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Active Users',
        data: userProgress.activeUsers,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
      },
      {
        label: 'Quiz Attempts',
        data: userProgress.quizAttempts,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y',
      }
    ]
  };
  
  const progressOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'User Activity Over Time'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Courses & Quizzes'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Active Users'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-xl text-blue-500">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor user progress and platform statistics</p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{userStats.totalUsers}</p>
            <p className="text-sm text-gray-500 mt-1">+{userStats.newThisMonth} this month</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{userStats.activeThisMonth}</p>
            <p className="text-sm text-gray-500 mt-1">{Math.round((userStats.activeThisMonth/userStats.totalUsers)*100)}% of total users</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Course Completion</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{userStats.completionRate}%</p>
            <p className="text-sm text-gray-500 mt-1">Average completion rate</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">CV Updates</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{cvUpdates.pendingUpdates}</p>
            <p className="text-sm text-gray-500 mt-1">Pending CV updates</p>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Course Popularity</h3>
            <div style={{ height: "300px", position: "relative" }}>
              <Bar 
                data={courseData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Distribution</h3>
            <div style={{ height: "300px", position: "relative" }}>
              <Pie 
                data={skillData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        {/* User Progress Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Progress Over Time</h3>
          <div style={{ height: "400px", position: "relative" }}>
            <Line 
              data={progressData} 
              options={{
                ...progressOptions,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
        
        {/* CV Updates Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">CV Management</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-700">Pending Updates</h4>
              <p className="text-2xl font-bold text-blue-600 mt-1">{cvUpdates.pendingUpdates}</p>
              <p className="text-xs text-gray-500">CVs waiting for update</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-700">Updated This Month</h4>
              <p className="text-2xl font-bold text-green-600 mt-1">{cvUpdates.updatedThisMonth}</p>
              <p className="text-xs text-gray-500">CVs automatically updated</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-700">Total Downloads</h4>
              <p className="text-2xl font-bold text-purple-600 mt-1">{cvUpdates.totalDownloads}</p>
              <p className="text-xs text-gray-500">CVs downloaded by users</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Process Pending Updates
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Generate Monthly Report
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
              Export CV Data
            </button>
          </div>
        </div>
        
        {/* User Profiles Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">User Profiles</h3>
            <div className="mt-3 md:mt-0 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search users..."
                className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{profile.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.courses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.quizzes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${profile.level === 'Beginner' ? 'bg-yellow-100 text-yellow-800' : 
                          profile.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {profile.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.lastActive}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-900 mr-3">Update CV</button>
                      <button className="text-purple-600 hover:text-purple-900">Download CV</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 