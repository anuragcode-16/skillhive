import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/auth';
import { FaPodcast } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa';
import PodcastCard from '../components/PodcastCard';

// Update API key handling
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || "";
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || "";

// Mock keywords for demo purposes
const DEMO_KEYWORDS = [
  "software engineering", 
  "career development", 
  "web development", 
  "programming", 
  "javascript",
  "react",
  "data science",
  "artificial intelligence"
];

// Updated mock podcasts data with more entries
const INITIAL_PODCASTS = [
  {
    id: "DtXfgiM_UR0",
    title: "All About Crypto: BitCoin | Blockchain | Web 3 | NFT | Ft. Rajesh Dhuddu | Telugu Podcast | HRS 22",
    description: "Is crypto still a worthy investment in 2025? In this insightful conversation with Rajesh Dhuddu, PwC Partner & Forbes 50 Blockchain Leader, we discuss the future of cryptocurrency, blockchain technology, NFTs, and Web 3.0 with a focus on investment opportunities.",
    channelTitle: "HeadRock Show",
    thumbnail: "https://i.ytimg.com/vi/DtXfgiM_UR0/mqdefault.jpg",
    duration: "PT1H11M05S",
    viewCount: "37000"
  },
  {
    id: "4EiM_-oM0Zk",
    title: "Balancing Innovation and Reliability in Software Engineering",
    description: "Dive into the world of software engineering where we discuss balancing innovation with reliability for successful product development.",
    channelTitle: "Tech Talks Daily",
    thumbnail: "https://i.ytimg.com/vi/4EiM_-oM0Zk/mqdefault.jpg",
    duration: "PT45M20S",
    viewCount: "125000"
  },
  {
    id: "6aQK6T_l3lM",
    title: "Career Development in Tech: From Junior to Senior Engineer",
    description: "Learn how to navigate your tech career from junior to senior positions with practical advice and strategies. Featuring interviews with tech leaders and practical tips for advancement.",
    channelTitle: "Code & Career",
    thumbnail: "https://i.ytimg.com/vi/6aQK6T_l3lM/mqdefault.jpg",
    duration: "PT1H12M45S",
    viewCount: "89500"
  },
  {
    id: "v2qhqLeZ5RM",
    title: "Modern Web Development Trends in 2023",
    description: "Explore the latest trends and technologies shaping web development in 2023, including new frameworks, tools, and methodologies that are changing how we build websites and applications.",
    channelTitle: "Web Dev Simplified",
    thumbnail: "https://i.ytimg.com/vi/v2qhqLeZ5RM/mqdefault.jpg",
    duration: "PT52M30S",
    viewCount: "210000"
  },
  {
    id: "lYMnjRLcMYk",
    title: "The Future of AI in Software Development",
    description: "Expert panel discusses how artificial intelligence is transforming the software development process and what developers need to know to stay relevant in this changing landscape.",
    channelTitle: "TechTalk",
    thumbnail: "https://i.ytimg.com/vi/lYMnjRLcMYk/mqdefault.jpg",
    duration: "PT1H05M12S",
    viewCount: "152300"
  },
  {
    id: "Nd9LbCWpwUU",
    title: "Data Science Career Paths and Opportunities",
    description: "A comprehensive overview of various career paths in data science, from analyst to scientist to engineer, with insights on required skills and how to transition between roles.",
    channelTitle: "Data Science Insights",
    thumbnail: "https://i.ytimg.com/vi/Nd9LbCWpwUU/mqdefault.jpg",
    duration: "PT58M45S",
    viewCount: "87600"
  }
];

const Podcasts = () => {
  const { currentUser } = useAuth();
  const [keywords, setKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [podcasts, setPodcasts] = useState(INITIAL_PODCASTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For custom keyword input
  const [customKeyword, setCustomKeyword] = useState('');

  // Load initial keywords
  useEffect(() => {
    // In a real implementation, this would load keywords from email analysis
    // For demo purposes, we'll use mock data
    setKeywords(DEMO_KEYWORDS);
  }, []);

  // Handle keyword selection
  const toggleKeyword = (keyword) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  // Add custom keyword
  const addCustomKeyword = () => {
    if (customKeyword.trim() && !keywords.includes(customKeyword.trim())) {
      const newKeyword = customKeyword.trim();
      setKeywords([...keywords, newKeyword]);
      setSelectedKeywords([...selectedKeywords, newKeyword]);
      setCustomKeyword('');
    }
  };

  // Fetch podcasts based on selected keywords
  const fetchPodcasts = async () => {
    if (selectedKeywords.length === 0) {
      setError("Please select at least one keyword");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if YouTube API key is available
      if (!YOUTUBE_API_KEY) {
        console.log("No YouTube API key provided - using mock data");
        
        // Filter mock podcasts based on keywords
        const filteredPodcasts = INITIAL_PODCASTS.filter(podcast => {
          return selectedKeywords.some(keyword => 
            podcast.title.toLowerCase().includes(keyword.toLowerCase()) ||
            podcast.description.toLowerCase().includes(keyword.toLowerCase()) ||
            podcast.channelTitle.toLowerCase().includes(keyword.toLowerCase())
          );
        });
        
        // If no matches found, use all podcasts
        if (filteredPodcasts.length === 0) {
          setPodcasts(INITIAL_PODCASTS);
        } else {
          setPodcasts(filteredPodcasts);
        }
        
        setLoading(false);
        return;
      }
      
      // Proceed with actual API call if key is available
      const responses = await Promise.all(
        selectedKeywords.slice(0, 3).map(async (keyword) => {
          try {
            const response = await axios.get(
              `https://www.googleapis.com/youtube/v3/search`, {
              params: {
                part: 'snippet',
                maxResults: 5,
                q: `${keyword} podcast`,
                type: 'video',
                videoDuration: 'long',
                key: YOUTUBE_API_KEY
              }
            });
            return response.data.items || [];
          } catch (err) {
            console.error(`Error fetching podcasts for keyword "${keyword}":`, err);
            return [];
          }
        })
      );

      // Flatten and deduplicate results
      const allVideos = responses.flat();
      
      if (allVideos.length === 0) {
        throw new Error("No podcasts found for the selected keywords");
      }
      
      const uniqueVideos = Array.from(new Set(allVideos.map(v => v.id?.videoId)))
        .filter(Boolean)
        .map(videoId => {
          return allVideos.find(v => v.id?.videoId === videoId);
        });

      if (uniqueVideos.length === 0) {
        throw new Error("No valid podcasts found");
      }

      // Fetch video details (duration, view count)
      const videoIds = uniqueVideos.map(v => v.id?.videoId).filter(Boolean).join(',');
      
      if (!videoIds) {
        throw new Error("Could not extract video IDs");
      }
      
      const detailsResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos`, {
        params: {
          part: 'contentDetails,statistics',
          id: videoIds,
          key: YOUTUBE_API_KEY
        }
      });

      // Merge details with videos
      const videosWithDetails = uniqueVideos.map(video => {
        const details = detailsResponse.data.items?.find(
          item => item.id === video.id?.videoId
        ) || {};
        
        return {
          id: video.id?.videoId,
          title: video.snippet?.title || 'Unknown Title',
          description: video.snippet?.description || 'No description available',
          channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
          thumbnail: video.snippet?.thumbnails?.high?.url || '',
          duration: details.contentDetails?.duration || 'PT0S',
          viewCount: details.statistics?.viewCount || '0'
        };
      });

      setPodcasts(videosWithDetails);
    } catch (err) {
      console.error("Error fetching podcasts:", err);
      setError("Could not fetch podcasts. Using recommended content instead.");
      
      // For demo, provide fallback data - use INITIAL_PODCASTS with keyword filtering
      const filteredPodcasts = INITIAL_PODCASTS.filter(podcast => {
        // Try to match keywords with podcast content
        return selectedKeywords.some(keyword => 
          podcast.title.toLowerCase().includes(keyword.toLowerCase()) ||
          podcast.description.toLowerCase().includes(keyword.toLowerCase())
        );
      });
      
      // If no matches found, use all initial podcasts
      setPodcasts(filteredPodcasts.length > 0 ? filteredPodcasts : INITIAL_PODCASTS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaPodcast className="mr-3 text-blue-500" />
            Career Podcast Recommender
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Discover podcasts tailored to your career interests and skills
          </p>
        </div>

        {/* Keywords Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaTag className="mr-2 text-blue-500" />
            Select Career Keywords
          </h2>
          <p className="text-gray-600 mb-4">
            Choose keywords related to your career interests to find relevant podcasts
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {keywords.map((keyword, index) => (
              <button
                key={index}
                onClick={() => toggleKeyword(keyword)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedKeywords.includes(keyword)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {keyword}
              </button>
            ))}
          </div>
          
          <div className="flex mb-6">
            <input
              type="text"
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              placeholder="Add your own keyword..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addCustomKeyword();
                  e.preventDefault();
                }
              }}
            />
            <button
              onClick={addCustomKeyword}
              disabled={!customKeyword.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              Add
            </button>
          </div>
          
          <button
            onClick={fetchPodcasts}
            disabled={selectedKeywords.length === 0 || loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                Finding Podcasts...
              </>
            ) : (
              <>
                <FaPodcast className="mr-2" />
                Find Podcasts
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-8">
            {error}
          </div>
        )}

        {/* Podcast Results */}
        {podcasts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">
              Recommended Podcasts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {podcasts.map((podcast) => (
                <PodcastCard
                  key={podcast.id}
                  podcast={podcast}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Podcasts; 