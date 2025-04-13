import { useState, useEffect } from 'react';
import { generateMCQs, generateCVBasedQuizzes } from '../hooks/mcqQuestions';
import run from '../api/ocr';
import { getVideos } from '../api/getVideos';

import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ResultsCharts = ({ topicScores, totalScore, totalQuestions }) => {
  const barChartData = {
    labels: Object.keys(topicScores),
    datasets: [
      {
        label: 'Correct Answers per Topic',
        data: Object.values(topicScores).map(score => score.correct),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
      {
        label: 'Incorrect Answers per Topic',
        data: Object.values(topicScores).map(score => score.total - score.correct),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      }
    ]
  };

  const pieChartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [totalScore, totalQuestions - totalScore],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Quiz Performance Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Performance by Topic</h3>
        <div style={{ height: "250px", position: "relative" }}>
          <Bar data={barChartData} options={{ ...options, responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Overall Performance</h3>
        <div style={{ height: "250px", position: "relative" }}>
          <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

// Add this new component for profile visualization
const ProfileVisualizer = ({ profile }) => {
  // Add guard to check if profile data exists
  if (!profile || !profile.skills || !profile.technical_skills || !profile.soft_skills || !profile.experience) {
    return (
      <div className="p-4 bg-white/30 backdrop-blur-sm rounded-lg">
        <p className="text-white">Insufficient profile data to visualize. Please try uploading your CV again.</p>
      </div>
    );
  }

  // Create data for skills pie chart
  const skillsData = {
    labels: [...profile.skills],
    datasets: [
      {
        label: 'Skills',
        data: profile.skills.map(() => 1), // Equal weight for each skill
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Create data for technical vs soft skills bar chart
  const skillTypesData = {
    labels: ['Technical Skills', 'Soft Skills'],
    datasets: [
      {
        label: 'Number of Skills',
        data: [profile.technical_skills.length, profile.soft_skills.length],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1
      }
    ]
  };

  // Options for bar chart
  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg">
        <h4 className="font-semibold text-white mb-2">Personal Info</h4>
        <div className="text-white">
          <p className="text-xl font-bold">{profile.personal_info.name}</p>
          <p className="text-sm">{profile.personal_info.email}</p>
          <p className="text-sm">{profile.personal_info.location}</p>
          <div className="mt-2 p-3 bg-white/20 rounded text-sm">
            <p>{profile.personal_info.summary}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Skills Overview</h4>
          <div className="bg-white/20 p-2 rounded-lg" style={{ height: "250px", position: "relative" }}>
            <Pie data={skillsData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Technical vs Soft Skills</h4>
          <div className="bg-white/20 p-2 rounded-lg" style={{ height: "250px", position: "relative" }}>
            <Bar data={skillTypesData} options={{ ...barOptions, responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
      
      <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg">
        <h4 className="font-semibold text-white mb-2">Experience Timeline</h4>
        <div className="space-y-2">
          {profile.experience.map((exp, index) => (
            <div key={index} className="flex bg-white/20 p-3 rounded-lg">
              <div className="w-32 flex-shrink-0 border-r border-white/30 pr-2">
                <p className="text-sm text-white">{exp.duration}</p>
              </div>
              <div className="ml-3">
                <p className="font-semibold text-white">{exp.title}</p>
                <p className="text-sm text-white/80">{exp.company}</p>
                <p className="text-xs text-white/70 mt-1">{exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add this new component for job recommendations visualization
const JobRecommendationsVisualizer = ({ recommendations }) => {
  // Add guard to check if recommendations data exists
  if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
    return (
      <div className="p-4 bg-white/30 backdrop-blur-sm rounded-lg">
        <p className="text-white">No job recommendations available. Please try uploading your CV again.</p>
      </div>
    );
  }
  
  // Create data for salary range comparison chart
  const salaryData = {
    labels: recommendations.map(job => job.title),
    datasets: [
      {
        label: 'Salary Range (Min)',
        data: recommendations.map(job => {
          const match = job.salary_range.match(/\$([0-9,]+)/g);
          return match ? parseInt(match[0].replace(/[$,]/g, '')) : 0;
        }),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Salary Range (Max)',
        data: recommendations.map(job => {
          const match = job.salary_range.match(/\$([0-9,]+)/g);
          return match && match.length > 1 ? parseInt(match[1].replace(/[$,]/g, '')) : 0;
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Options for the salary chart
  const salaryOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Salary (USD)'
        }
      }
    }
  };
  
  // Count industries for pie chart
  const industries = recommendations.reduce((acc, job) => {
    acc[job.industry] = (acc[job.industry] || 0) + 1;
    return acc;
  }, {});
  
  const industryData = {
    labels: Object.keys(industries),
    datasets: [
      {
        label: 'Industries',
        data: Object.values(industries),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1
      }
    ]
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg">
        <h4 className="font-semibold text-white mb-2">Salary Comparison</h4>
        <div className="bg-white/20 p-2 rounded-lg" style={{ height: "250px", position: "relative" }}>
          <Bar data={salaryData} options={{ ...salaryOptions, responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Industry Distribution</h4>
          <div className="bg-white/20 p-2 rounded-lg" style={{ height: "200px", position: "relative" }}>
            <Pie data={industryData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Required Skills</h4>
          <div className="space-y-2">
            {recommendations.map((job, index) => (
              <div key={index} className="text-sm">
                <p className="text-white font-semibold">{job.title}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.required_skills.map((skill, i) => (
                    <span key={i} className="bg-white/20 px-2 py-1 rounded text-xs text-white">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// VideoRecommendations Component
const VideoRecommendations = ({ quizResults }) => {
  const [recommendedVideos, setRecommendedVideos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Suggested videos for common topics if no results are found
  const fallbackVideoLinks = {
    "Web Development": [
      {
        title: "Web Development Full Course - 10 Hours | Learn Web Development from Scratch",
        url: "https://www.youtube.com/watch?v=Q33KBiDriJY",
        thumbnail: "https://i.ytimg.com/vi/Q33KBiDriJY/hqdefault.jpg",
        channelTitle: "Edureka",
        duration: "PT10H2M30S",
        viewCount: "2300000"
      },
      {
        title: "HTML & CSS Full Course - Beginner to Pro",
        url: "https://www.youtube.com/watch?v=G3e-cpL7ofc",
        thumbnail: "https://i.ytimg.com/vi/G3e-cpL7ofc/hqdefault.jpg",
        channelTitle: "SuperSimpleDev",
        duration: "PT6H30M",
        viewCount: "4500000"
      },
      {
        title: "JavaScript Tutorial for Beginners: Learn JavaScript in 1 Hour",
        url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        thumbnail: "https://i.ytimg.com/vi/W6NZfCO5SIk/hqdefault.jpg",
        channelTitle: "Programming with Mosh",
        duration: "PT48M17S",
        viewCount: "6100000"
      }
    ],
    "JavaScript": [
      {
        title: "JavaScript Full Course for Beginners",
        url: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
        thumbnail: "https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg",
        channelTitle: "freeCodeCamp.org",
        duration: "PT3H26M43S",
        viewCount: "5700000"
      },
      {
        title: "Learn JavaScript - Full Course for Beginners",
        url: "https://www.youtube.com/watch?v=jS4aFq5-91M",
        thumbnail: "https://i.ytimg.com/vi/jS4aFq5-91M/hqdefault.jpg",
        channelTitle: "freeCodeCamp.org",
        duration: "PT7H25M12S",
        viewCount: "3200000"
      },
      {
        title: "JavaScript Programming - Full Course",
        url: "https://www.youtube.com/watch?v=jS4aFq5-91M",
        thumbnail: "https://i.ytimg.com/vi/jS4aFq5-91M/hqdefault.jpg",
        channelTitle: "freeCodeCamp.org",
        duration: "PT8H16M44S",
        viewCount: "1800000"
      }
    ],
    "Software Engineering": [
      {
        title: "Software Engineering Basics",
        url: "https://www.youtube.com/watch?v=3loACSxowRU",
        thumbnail: "https://i.ytimg.com/vi/3loACSxowRU/hqdefault.jpg",
        channelTitle: "MIT OpenCourseWare",
        duration: "PT45M33S",
        viewCount: "980000"
      },
      {
        title: "How to Learn to Code - Best Resources, How to Choose a Project, and more!",
        url: "https://www.youtube.com/watch?v=WKuNWrxuJ9g",
        thumbnail: "https://i.ytimg.com/vi/WKuNWrxuJ9g/hqdefault.jpg",
        channelTitle: "CS Dojo",
        duration: "PT9M35S",
        viewCount: "1400000"
      },
      {
        title: "5 Books Every Software Engineer Should Read",
        url: "https://www.youtube.com/watch?v=NlK0QRZVKgc",
        thumbnail: "https://i.ytimg.com/vi/NlK0QRZVKgc/hqdefault.jpg",
        channelTitle: "Tech With Tim",
        duration: "PT12M38S",
        viewCount: "650000"
      }
    ],
    "Data Structures": [
      {
        title: "Data Structures Easy to Advanced Course - Full Tutorial from a Google Engineer",
        url: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
        thumbnail: "https://i.ytimg.com/vi/RBSGKlAvoiM/hqdefault.jpg",
        channelTitle: "freeCodeCamp.org",
        duration: "PT8H32M27S",
        viewCount: "3800000"
      },
      {
        title: "Data Structures and Algorithms in JavaScript - Full Course for Beginners",
        url: "https://www.youtube.com/watch?v=t2CEgPsws3U",
        thumbnail: "https://i.ytimg.com/vi/t2CEgPsws3U/hqdefault.jpg",
        channelTitle: "freeCodeCamp.org",
        duration: "PT6H20M53S",
        viewCount: "1250000"
      }
    ],
    "Programming Fundamentals": [
      {
        title: "Introduction to Programming and Computer Science - Full Course",
        url: "https://www.youtube.com/watch?v=zOjov-2OZ0E",
        thumbnail: "https://i.ytimg.com/vi/zOjov-2OZ0E/hqdefault.jpg",
        channelTitle: "freeCodeCamp.org",
        duration: "PT1H59M38S",
        viewCount: "1700000"
      },
      {
        title: "Computer Science Basics: Algorithms",
        url: "https://www.youtube.com/watch?v=kM9ASKAni_s",
        thumbnail: "https://i.ytimg.com/vi/kM9ASKAni_s/hqdefault.jpg",
        channelTitle: "Crash Course",
        duration: "PT11M43S",
        viewCount: "850000"
      }
    ]
  };

  useEffect(() => {
    const fetchVideoRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get topics and their scores
        const topicsWithScores = Object.keys(quizResults).map(topic => ({
          topic,
          score: quizResults[topic].score,
          correct: quizResults[topic].correct,
          total: quizResults[topic].totalQuestions
        }));

        console.log('Quiz results for video recommendations:', topicsWithScores);

        // Sort by score ascending (lowest scores first - these need most improvement)
        topicsWithScores.sort((a, b) => a.score - b.score);
        
        // Get topics where score is less than 70% (needs improvement)
        let topicsToFetch = topicsWithScores
          .filter(item => item.score < 70)
          .map(item => item.topic)
          .slice(0, 3); // Get up to 3 weak topics
        
        // If all scores are good, recommend videos for top scoring topics for further advancement
        if (topicsToFetch.length === 0) {
          // Sort by score descending (highest scores first)
          topicsWithScores.sort((a, b) => b.score - a.score);
          topicsToFetch = topicsWithScores
            .map(item => item.topic)
            .slice(0, 3); // Get up to 3 top topics
        }
        
        console.log('Fetching videos for topics:', topicsToFetch);
        
        // Fetch videos for each topic
        const videoPromises = topicsToFetch.map(async topic => {
          try {
            // Create a more specific search query based on the topic and performance
            const topicData = topicsWithScores.find(t => t.topic === topic);
            
            // Determine search query based on score
            let searchQuery;
            if (topicData.score < 50) {
              searchQuery = `${topic} beginner tutorial basics`;
            } else if (topicData.score < 70) {
              searchQuery = `${topic} intermediate tutorial concepts`;
            } else {
              searchQuery = `${topic} advanced tutorial mastery`;
            }
            
            console.log(`Fetching videos for topic: ${topic} with query: ${searchQuery}`);
            const videos = await getVideos(searchQuery);
            
            // If no videos found, use fallback videos if available
            if (videos.length === 0 && fallbackVideoLinks[topic]) {
              console.log(`Using fallback videos for ${topic}`);
              return { 
                topic, 
                videos: fallbackVideoLinks[topic], 
                usedFallback: true 
              };
            }
            
            return { 
              topic, 
              videos: videos.slice(0, 3), // Limit to 3 videos per topic
              usedFallback: false 
            };
          } catch (error) {
            console.error(`Error fetching videos for ${topic}:`, error);
            
            // Use fallback videos if available when API fails
            if (fallbackVideoLinks[topic]) {
              console.log(`Using fallback videos for ${topic} after API error`);
              return { 
                topic, 
                videos: fallbackVideoLinks[topic], 
                usedFallback: true, 
                error: false 
              };
            }
            
            return { topic, videos: [], error: true };
          }
        });
        
        const results = await Promise.all(videoPromises);
        
        // Convert to object format
        const videosObject = {};
        results.forEach(result => {
          videosObject[result.topic] = {
            videos: result.videos,
            error: result.error || false,
            score: quizResults[result.topic].score,
            usedFallback: result.usedFallback || false
          };
        });
        
        setRecommendedVideos(videosObject);
      } catch (err) {
        console.error('Error getting video recommendations:', err);
        setError('Failed to load video recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    if (Object.keys(quizResults).length > 0) {
      fetchVideoRecommendations();
    }
  }, [quizResults]);
  
  // Format video duration (PT1H2M3S -> 1:02:03)
  const formatDuration = (duration) => {
    if (!duration) return '';
    
    // Remove PT from the start
    const time = duration.replace('PT', '');
    
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    // Extract hours, minutes, seconds
    if (time.includes('H')) {
      hours = parseInt(time.split('H')[0]);
      if (time.includes('M')) {
        minutes = parseInt(time.split('H')[1].split('M')[0]);
      }
      if (time.includes('S')) {
        seconds = parseInt(time.split('S')[0].split('M')[1] || time.split('S')[0].split('H')[1]);
      }
    } else if (time.includes('M')) {
      minutes = parseInt(time.split('M')[0]);
      if (time.includes('S')) {
        seconds = parseInt(time.split('M')[1].split('S')[0]);
      }
    } else if (time.includes('S')) {
      seconds = parseInt(time.split('S')[0]);
    }
    
    // Format as hh:mm:ss or mm:ss
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
  
  // Format view count (1234567 -> 1.2M)
  const formatViewCount = (count) => {
    if (!count) return '';
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    } else {
      return `${num} views`;
    }
  };
  
  if (loading) {
    return (
      <div className="mt-8 text-center p-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Finding the best learning resources for you...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mt-8 bg-red-50 p-4 rounded-lg text-red-600">
        <p>{error}</p>
      </div>
    );
  }
  
  const topicKeys = Object.keys(recommendedVideos);
  
  if (topicKeys.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-xl font-bold mb-6">Recommended Learning Resources</h3>
      
      <p className="text-gray-600 mb-6">
        Based on your quiz performance, we've curated these videos to help you improve in areas that need attention
        and deepen your knowledge in topics you're already strong in.
      </p>
      
      {topicKeys.map(topic => (
        <div key={topic} className="mb-8">
          <div className="flex items-center mb-4">
            <h4 className="text-lg font-semibold">{topic}</h4>
            <div className="ml-3 px-2 py-1 rounded text-sm bg-opacity-10 flex items-center"
                style={{
                  backgroundColor: recommendedVideos[topic].score < 70 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                  color: recommendedVideos[topic].score < 70 ? '#ef4444' : '#22c55e'
                }}>
              <span>{recommendedVideos[topic].score}%</span>
              {recommendedVideos[topic].score < 50 ? (
                <span className="ml-1 text-xs">Focus area - start with basics</span>
              ) : recommendedVideos[topic].score < 70 ? (
                <span className="ml-1 text-xs">Needs improvement - build skills</span>
              ) : (
                <span className="ml-1 text-xs">Strong area - advance further</span>
              )}
            </div>
          </div>
          
          {recommendedVideos[topic].score < 70 ? (
            <p className="text-sm text-gray-600 mb-3">
              Strengthen your understanding of core {topic} concepts with these recommended tutorials.
            </p>
          ) : (
            <p className="text-sm text-gray-600 mb-3">
              Deepen your knowledge with these advanced {topic} resources to master the subject.
            </p>
          )}
          
          {recommendedVideos[topic].usedFallback && (
            <p className="text-blue-500 italic text-sm mb-3">
              Using recommended resources for this topic
            </p>
          )}
          
          {recommendedVideos[topic].error ? (
            <p className="text-gray-500 italic">Couldn't load videos for this topic. Please try again later.</p>
          ) : recommendedVideos[topic].videos.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 italic mb-2">No videos found for this topic.</p>
              <p className="text-gray-600 mb-2">Try searching YouTube directly:</p>
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  Search YouTube for "{topic} tutorial"
                </span>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedVideos[topic].videos.map((video, idx) => (
                <a 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  key={idx}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-40 object-cover"
                    />
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h5 className="font-medium mb-2 line-clamp-2">{video.title}</h5>
                    <p className="text-gray-600 text-sm mb-1">{video.channelTitle}</p>
                    {video.viewCount && (
                      <p className="text-gray-500 text-xs">{formatViewCount(video.viewCount)}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [allQuizzes, setAllQuizzes] = useState({}); // Store all quizzes by topic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [customTopics, setCustomTopics] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [videoRecommendationsVisible, setVideoRecommendationsVisible] = useState(false);
  const [usingCVBasedQuiz, setUsingCVBasedQuiz] = useState(false);

  // Ensure Chart.js is properly initialized
  useEffect(() => {
    // Make sure Chart is properly registered
    if (!Chart.registry.controllers.get('bar')) {
      Chart.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend,
        ArcElement
      );
    }

    // Log to verify it's registered
    console.log('Chart registry initialized:', Chart.registry.controllers.get('bar') !== undefined);
  }, []);

  // Default topics if no CV analysis available
  const defaultTopics = [
    'Web Development', 
    'JavaScript',
    'Software Engineering',
    'Data Structures',
    'Programming Fundamentals'
  ];
  
  // Get active topics based on CV analysis or defaults
  const topics = customTopics.length > 0 ? customTopics : defaultTopics;

  // Function to generate custom topics based on CV analysis
  const generateCustomTopics = (profile, recommendations) => {
    // Extract skills from profile and job recommendations
    const profileSkills = [...profile.skills, ...profile.technical_skills];
    
    // Extract required skills from job recommendations
    const requiredSkills = recommendations.reduce((skills, job) => {
      return [...skills, ...job.required_skills];
    }, []);
    
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
    
    console.log('Generated custom topics based on CV:', relevantTopics);
    return relevantTopics;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('File selected:', file.name, file.type, file.size);
    setLoading(true);
    setError(null);
    setCvAnalysis(null);
    setCustomTopics([]);
    setUsingCVBasedQuiz(false);
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Starting CV processing...');
      const analysis = await run(file);
      console.log('CV processing result:', analysis);
      
      if (!analysis.success) {
        throw new Error(analysis.error || 'Failed to analyze CV');
      }
      
      // Verify that the analysis contains valid profile and recommendation data
      if (!analysis.profile || !analysis.recommendations) {
        throw new Error('Analysis returned incomplete data. Please try uploading again.');
      }

      console.log('Profile data:', analysis.profile);
      console.log('Recommendations:', analysis.recommendations);
      
      // Only set the analysis if the data is valid
      setCvAnalysis(analysis);
      
      // Generate topics based on CV analysis
      const topics = generateCustomTopics(analysis.profile, analysis.recommendations);
      setCustomTopics(topics.length > 0 ? topics : defaultTopics);
      setUsingCVBasedQuiz(true);
      
    } catch (error) {
      console.error('Error analyzing CV:', error);
      setError('Error analyzing CV: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Function to use a demo CV
  const useDemo = async () => {
    setLoading(true);
    setError(null);
    setCvAnalysis(null);
    setCustomTopics([]);
    setUsingCVBasedQuiz(false);
    
    try {
      console.log('Using demo CV...');
      
      // Create guidance text instead of demo content
      const guidanceText = `Please upload your actual CV/resume to get personalized analysis.

To get the best results:
1. Make sure your CV is a PDF with text content (not scanned images)
2. Include your skills section clearly labeled
3. Include your work experience with job titles, companies, and dates
4. Include your education information
5. If you have any specific interests or industry preferences, include those as well

This will help provide the most accurate analysis and job recommendations based on your actual experience and skills.`;
      
      // Display guidance to the user
      setError(guidanceText);
      setLoading(false);
      
    } catch (error) {
      console.error('Error using demo CV:', error);
      setError('Please upload your actual CV for analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch quizzes when user starts the quiz or when topics change
  const fetchQuizzes = async () => {
    setLoadingQuiz(true);
    setError(null);
    
    try {
      if (usingCVBasedQuiz && cvAnalysis) {
        // Generate quiz based on CV analysis using Gemini API
        console.log('Generating CV-based quizzes for profile:', cvAnalysis.profile);
        
        // Extract required skills from job recommendations
        const requiredSkills = cvAnalysis.recommendations.reduce((skills, job) => {
          return [...skills, ...job.required_skills];
        }, []);
        
        // Generate personalized quizzes based on CV
        const result = await generateCVBasedQuizzes(cvAnalysis.profile, requiredSkills);
        console.log('CV-based quiz generated:', result);
        
        setAllQuizzes(result);
        setCurrentTopicIndex(0);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setQuizStarted(true);
      } else {
        // Fallback to standard topic-based quizzes
        console.log('Fetching standard quizzes for topics:', topics);
        const quizPromises = topics.map(topic => generateMCQs(topic));
        const results = await Promise.all(quizPromises);
        
        const quizzesByTopic = {};
        results.forEach((result, index) => {
          quizzesByTopic[topics[index]] = JSON.parse(result);
        });
        
        setAllQuizzes(quizzesByTopic);
        setCurrentTopicIndex(0);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setQuizStarted(true);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to generate quiz questions. Please try again later.');
      
      // Fallback to standard quizzes if CV-based quiz fails
      if (usingCVBasedQuiz) {
        console.log('Falling back to standard quizzes');
        try {
          const quizPromises = topics.map(topic => generateMCQs(topic));
          const results = await Promise.all(quizPromises);
          
          const quizzesByTopic = {};
          results.forEach((result, index) => {
            quizzesByTopic[topics[index]] = JSON.parse(result);
          });
          
          setAllQuizzes(quizzesByTopic);
          setCurrentTopicIndex(0);
          setCurrentQuestionIndex(0);
          setSelectedAnswers({});
          setShowResults(false);
          setQuizStarted(true);
          setError(null); // Clear error since we recovered
        } catch (fallbackErr) {
          console.error('Even fallback quizzes failed:', fallbackErr);
        }
      }
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleStartQuiz = () => {
    fetchQuizzes();
  };

  const handleAnswerSelect = (topicIndex, questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [`${topicIndex}-${questionIndex}`]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    const currentTopicQuestions = allQuizzes[topics[currentTopicIndex]];
    
    if (currentQuestionIndex < currentTopicQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentTopicIndex < topics.length - 1) {
      setCurrentTopicIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      setShowResults(true);
    }
  };

  const getCurrentQuestion = () => {
    if (!quizStarted) return null;
    
    // Handle CV-based quiz format (object with topic keys)
    const currentTopic = topics[currentTopicIndex] || Object.keys(allQuizzes)[currentTopicIndex];
    const questions = allQuizzes[currentTopic];
    
    if (!questions) return null;
    return questions[currentQuestionIndex];
  };

  const calculateDetailedScore = () => {
    const topicScores = {};
    let totalCorrect = 0;
    let totalQuestions = 0;

    topics.forEach((topic, topicIndex) => {
      const topicQuestions = allQuizzes[topic];
      if (topicQuestions) {
        let correctForTopic = 0;
        topicQuestions.forEach((_, questionIndex) => {
          const answer = selectedAnswers[`${topicIndex}-${questionIndex}`];
          const correctAnswer = topicQuestions[questionIndex].correctAnswer - 1;
          if (answer === correctAnswer) {
            correctForTopic++;
            totalCorrect++;
          }
          totalQuestions++;
        });

        topicScores[topic] = {
          correct: correctForTopic,
          total: topicQuestions.length
        };
      }
    });

    return { topicScores, totalCorrect, totalQuestions };
  };

  // Calculate quiz results for all completed topics
  const calculateResults = () => {
    const results = {};
    
    // Get all the topics that have quiz data
    const topicsWithQuizzes = Object.keys(allQuizzes);
    
    topicsWithQuizzes.forEach(topic => {
      const quizQuestions = allQuizzes[topic];
      let correctCount = 0;
      let totalAnswered = 0;
      
      quizQuestions.forEach((_, qIndex) => {
        const answerKey = `${topicsWithQuizzes.indexOf(topic)}-${qIndex}`;
        const userAnswer = selectedAnswers[answerKey];
        
        if (userAnswer !== undefined) {
          totalAnswered++;
          if (userAnswer === quizQuestions[qIndex].correctAnswerIndex - 1) {
            correctCount++;
          }
        }
      });
      
      // Calculate percentage score
      const score = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      
      results[topic] = {
        totalQuestions: quizQuestions.length,
        answered: totalAnswered,
        correct: correctCount,
        score: score
      };
    });
    
    return results;
  };
  
  // Update handleShowResults function to calculate results
  const handleShowResults = () => {
    setShowResults(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Fancy CV Upload Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Upload Your CV</h2>
            <p className="mb-6 text-white/80">Upload your PDF resume to get an AI-powered analysis, job recommendations, and a personalized quiz based on your skills.</p>
            
            <div className="relative">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileUpload}
                className="hidden" 
                id="cv-upload"
                disabled={loading}
              />
              <label 
                htmlFor="cv-upload" 
                className={`cursor-pointer bg-white ${loading ? 'bg-gray-200' : 'hover:bg-gray-100'} text-blue-600 px-6 py-3 rounded-lg inline-block transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : 'Choose PDF File'}
              </label>

              <span className="mx-2 text-white">or</span>
              
              <button
                onClick={useDemo}
                disabled={loading}
                className={`cursor-pointer bg-transparent border border-white text-white px-6 py-3 rounded-lg inline-block hover:bg-white/10 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Try Demo
              </button>
            </div>
            
            {/* File Tips */}
            <div className="mt-4 text-sm text-white/70">
              <p>For best results:</p>
              <ul className="mt-2 list-disc list-inside">
                <li>Use a PDF with selectable text (not scanned images)</li>
                <li>Ensure file size is under 5MB</li>
                <li>Include skills, experience, and education sections</li>
              </ul>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-500/30 backdrop-blur-sm px-4 py-3 rounded text-white text-sm">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
                <p className="mt-2 text-xs">
                  Try using a different PDF file with selectable text content.
                </p>
              </div>
            )}
            
            {/* Loading State */}
            {loading && (
              <div className="mt-6">
                <div className="flex justify-center mb-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                </div>
                <p className="text-sm text-white/80">
                  Analyzing your CV... This might take a few moments.
                </p>
              </div>
            )}
          </div>
          
          {/* CV Analysis Results */}
          {cvAnalysis && !loading && (
            <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">CV Analysis Results</h3>
              {console.log('CV Analysis for rendering:', cvAnalysis)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">Profile</h4>
                  <ProfileVisualizer profile={cvAnalysis.profile} />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Job Recommendations</h4>
                  <JobRecommendationsVisualizer recommendations={cvAnalysis.recommendations} />
                </div>
              </div>
              
              {/* Custom Quiz Topics Section */}
              <div className="mt-6 bg-white/30 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Personalized Quiz</h4>
                <p className="text-white/80 text-sm mb-3">
                  Based on your CV analysis, we'll create a customized quiz tailored to your skills and experience. Your quiz will focus on these key areas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {customTopics.map((topic, index) => (
                    <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleStartQuiz}
                    disabled={loadingQuiz}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {loadingQuiz ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Your Personalized Quiz...
                      </span>
                    ) : (
                      'Take Personalized Quiz'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {!quizStarted ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to test your knowledge?</h2>
              <p className="text-gray-600 mb-6">
                {cvAnalysis 
                  ? 'Take a personalized quiz generated specifically for your skills and experience.' 
                  : 'Upload your CV to get a personalized quiz, or take our standard quiz.'}
              </p>
              <button
                onClick={handleStartQuiz}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled={loadingQuiz}
              >
                {loadingQuiz ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {usingCVBasedQuiz ? 'Creating Your Personalized Quiz...' : 'Generating Quiz...'}
                  </span>
                ) : (
                  usingCVBasedQuiz ? 'Take Your Personalized Quiz' : 'Take Quiz'
                )}
              </button>
            </div>
          ) : (
            <>
              {!showResults ? (
                <div>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold">
                      {topics[currentTopicIndex] || Object.keys(allQuizzes)[currentTopicIndex]}
                    </h2>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Topic {currentTopicIndex + 1} of {Object.keys(allQuizzes).length}</span>
                      <span>
                        Question {currentQuestionIndex + 1} of {
                          Array.isArray(allQuizzes[topics[currentTopicIndex]]) 
                            ? allQuizzes[topics[currentTopicIndex]]?.length 
                            : allQuizzes[Object.keys(allQuizzes)[currentTopicIndex]]?.length
                        }
                      </span>
                    </div>
                  </div>

                  {getCurrentQuestion() && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="font-semibold mb-4">{getCurrentQuestion().question}</h3>
                      <div className="space-y-3">
                        {getCurrentQuestion().options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center">
                            <input
                              type="radio"
                              name={`question-${currentTopicIndex}-${currentQuestionIndex}`}
                              id={`option-${optIndex}`}
                              className="mr-3"
                              checked={selectedAnswers[`${currentTopicIndex}-${currentQuestionIndex}`] === optIndex}
                              onChange={() => handleAnswerSelect(currentTopicIndex, currentQuestionIndex, optIndex)}
                            />
                            <label htmlFor={`option-${optIndex}`}>{option}</label>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={handleNextQuestion}
                        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={selectedAnswers[`${currentTopicIndex}-${currentQuestionIndex}`] === undefined}
                      >
                        Next Question
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold mb-4">Quiz Complete! 🎉</h2>
                  {(() => {
                    const { topicScores, totalCorrect, totalQuestions } = calculateDetailedScore();
                    return (
                      <div>
                        <div className="mb-4">
                          <p className="text-lg">Your Score: {totalCorrect} out of {totalQuestions}</p>
                          <p className="text-lg">Percentage: {((totalCorrect / totalQuestions) * 100).toFixed(1)}%</p>
                        </div>
                        
                        <ResultsCharts 
                          topicScores={topicScores}
                          totalScore={totalCorrect}
                          totalQuestions={totalQuestions}
                        />

                        <div className="mt-8 border-t pt-6">
                          <button
                            onClick={() => setVideoRecommendationsVisible(!videoRecommendationsVisible)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            {videoRecommendationsVisible ? 'Hide Video Recommendations' : 'Get Personalized Video Recommendations Based on Results'}
                          </button>
                          
                          {!videoRecommendationsVisible && (
                            <p className="text-sm text-gray-500 mt-2">
                              We'll suggest learning resources tailored to your performance in each topic
                            </p>
                          )}
                        </div>

                        {videoRecommendationsVisible && (
                          <div className="mt-6 border-t pt-6">
                            <VideoRecommendations quizResults={calculateResults()} />
                          </div>
                        )}

                        <div className="mt-6">
                          <button
                            onClick={handleStartQuiz}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Try Quiz Again
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;