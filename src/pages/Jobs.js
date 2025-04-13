import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/auth';
import { MdWorkOutline, MdUploadFile, MdPersonSearch } from 'react-icons/md';
import { IoLocationOutline } from 'react-icons/io5';
import { FaMoneyBillWave, FaBuilding, FaClock, FaCalendarAlt } from 'react-icons/fa';
import run from '../api/ocr';

// Mock API key - in production, use environment variables
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || "your-api-key";

// Fallback job data in case API calls fail
const FALLBACK_JOBS = [
  {
    title: "Senior React Developer",
    company: "TechGlobal Solutions",
    location: "San Francisco, CA (Remote)",
    salary_range: "$120,000 - $150,000",
    experience_level: "Senior (5+ years)",
    job_type: "Full-time",
    posted_date: "2023-03-10",
    application_url: "https://example.com/apply",
    description: "We are seeking a skilled React developer to join our team and work on cutting-edge web applications. You will be responsible for developing and implementing user interface components using React.js concepts and workflows.",
    requirements: [
      "5+ years of experience with React.js",
      "Strong knowledge of JavaScript, HTML5, and CSS3",
      "Experience with Redux or similar state management libraries",
      "Familiarity with RESTful APIs",
      "Bachelor's degree in Computer Science or related field"
    ]
  },
  {
    title: "Product Manager",
    company: "InnovateCorp",
    location: "New York, NY",
    salary_range: "$110,000 - $135,000",
    experience_level: "Mid-Level (3-5 years)",
    job_type: "Full-time",
    posted_date: "2023-03-15",
    application_url: "https://example.com/apply",
    description: "Join our product team to lead the development of next-generation SaaS solutions. You will work closely with engineering, design, and marketing teams to define product vision and roadmap.",
    requirements: [
      "3-5 years of product management experience",
      "Experience with agile methodologies",
      "Strong analytical and problem-solving skills",
      "Excellent communication and presentation abilities",
      "Background in SaaS products preferred"
    ]
  },
  {
    title: "UX/UI Designer",
    company: "Creative Designs Inc.",
    location: "Austin, TX (Hybrid)",
    salary_range: "$90,000 - $110,000",
    experience_level: "Mid-Level (2-4 years)",
    job_type: "Full-time",
    posted_date: "2023-03-12",
    application_url: "https://example.com/apply",
    description: "We're looking for a talented UX/UI Designer to create amazing user experiences. The ideal candidate should have a strong portfolio demonstrating their ability to create intuitive and visually appealing interfaces.",
    requirements: [
      "2-4 years of experience in UX/UI design",
      "Proficiency with design tools like Figma, Sketch, or Adobe XD",
      "Knowledge of user research and usability testing",
      "Ability to create wireframes, prototypes, and high-fidelity designs",
      "Strong understanding of design principles and trends"
    ]
  },
  {
    title: "Data Scientist",
    company: "DataInsights Analytics",
    location: "Chicago, IL",
    salary_range: "$115,000 - $140,000",
    experience_level: "Senior (5+ years)",
    job_type: "Full-time",
    posted_date: "2023-03-08",
    application_url: "https://example.com/apply",
    description: "Join our data science team to extract insights from complex datasets and develop machine learning models. You will work on challenging problems and help drive business decisions through data analysis.",
    requirements: [
      "5+ years of experience in data science or related field",
      "Strong programming skills in Python or R",
      "Experience with machine learning and statistical modeling",
      "Knowledge of data visualization tools",
      "Master's or PhD in Computer Science, Statistics, or related field"
    ]
  }
];

const Jobs = () => {
  const { currentUser } = useAuth();
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [numJobs, setNumJobs] = useState(4);
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelName, setModelName] = useState('gemini-1.5-pro');
  const [resumeText, setResumeText] = useState('');

  // New state for CV upload
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState(null);
  const [usingCvData, setUsingCvData] = useState(false);
  const [shouldLoadDemoCV, setShouldLoadDemoCV] = useState(false);

  // Function to clean JSON strings from API response
  const cleanJsonString = (str) => {
    if (!str) return '';
    // Find the first opening brace and last closing brace
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) return '';

    // Extract the JSON part
    return str.substring(firstBrace, lastBrace + 1);
  };

  // Validate if job listings conform to expected format
  const validateJobListings = (jobs) => {
    if (!Array.isArray(jobs)) return false;

    // Check if all required fields are present
    return jobs.every(job =>
      job.title &&
      job.company &&
      job.location &&
      job.description &&
      Array.isArray(job.requirements)
    );
  };

  // Handle CV file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setCvLoading(true);
    setCvError(null);
    setCvAnalysis(null);
    setUsingCvData(false);

    if (file.type !== 'application/pdf') {
      setCvError('Please upload a PDF file');
      setCvLoading(false);
      return;
    }

    try {
      console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
      const analysis = await run(file);
      
      if (!analysis || !analysis.success) {
        throw new Error(analysis?.error || 'Failed to analyze CV');
      }
      
      setCvAnalysis(analysis);

      // Auto-populate fields from CV analysis
      if (analysis.profile?.industry_preferences?.length > 0) {
        setIndustry(analysis.profile.industry_preferences[0]);
      } else if (analysis.profile?.technical_skills?.length > 0) {
        setIndustry(analysis.profile.technical_skills[0]);
      } else if (analysis.profile?.skills?.length > 0) {
        setIndustry(analysis.profile.skills[0]);
      }

      if (analysis.profile?.personal_info?.location) {
        setLocation(analysis.profile.personal_info.location);
      }

      setUsingCvData(true);
    } catch (error) {
      console.error('Error analyzing CV:', error);
      setCvError('Error analyzing CV: ' + (error.message || 'Unknown error'));
      
      // Use demo data as fallback when real processing fails
      if (process.env.NODE_ENV !== 'production') {
        console.log('Using fallback demo data due to processing error');
        setTimeout(() => {
          setShouldLoadDemoCV(true);
        }, 1000);
      }
    } finally {
      setCvLoading(false);
    }
  };

  // Function to trigger demo CV usage
  const useDemoCV = () => {
    setShouldLoadDemoCV(true);
  };

  // Effect to handle demo CV loading when the flag is set
  useEffect(() => {
    if (shouldLoadDemoCV) {
      loadDemoCV();
    }
  }, [shouldLoadDemoCV]);

  // Load demo CV data for testing
  const loadDemoCV = async () => {
    setCvLoading(true);
    setCvError(null);
    setCvAnalysis(null);

    try {
      // Create a small dummy file to pass to the run function
      const dummyContent = "Demo CV content - John Doe - Software Developer";
      const dummyFile = new File([dummyContent], "demo-cv.pdf", { 
        type: "application/pdf",
        lastModified: new Date().getTime()
      });
      
      // Add a demo flag to the file object
      Object.defineProperty(dummyFile, 'isDemo', { value: true });
      
      console.log('Loading demo CV file...');
      const analysis = await run(dummyFile);

      if (!analysis || !analysis.success) {
        throw new Error(analysis?.error || 'Failed to load demo CV');
      }

      setCvAnalysis(analysis);
      
      // Auto-populate fields from CV analysis
      if (analysis.profile?.industry_preferences && analysis.profile.industry_preferences.length > 0) {
        setIndustry(analysis.profile.industry_preferences[0]);
      } else if (analysis.profile?.technical_skills && analysis.profile.technical_skills.length > 0) {
        setIndustry(analysis.profile.technical_skills[0]);
      } else if (analysis.profile?.skills && analysis.profile.skills.length > 0) {
        setIndustry(analysis.profile.skills[0]);
      }

      if (analysis.profile?.personal_info?.location) {
        setLocation(analysis.profile.personal_info.location);
      }

      setUsingCvData(true);

    } catch (error) {
      console.error('Error loading demo CV:', error);
      setCvError('Error loading demo CV: ' + (error.message || 'Unknown error'));
      
      // Fallback to hardcoded values if the demo fails
      setIndustry('Technology');
      setLocation('San Francisco, CA');
    } finally {
      setCvLoading(false);
      setShouldLoadDemoCV(false); // Reset the flag
    }
  };

  // Generate job listings
  const generateJobListings = async () => {
    if (!industry || !location) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    setJobListings([]);

    // Create a context from CV data if available
    let cvContext = '';
    if (usingCvData && cvAnalysis && cvAnalysis.profile) {
      const profile = cvAnalysis.profile;
      cvContext = `
        The job seeker has the following profile:
        - Skills: ${profile.skills?.join(', ') || 'Not specified'}
        - Technical skills: ${profile.technical_skills?.join(', ') || 'Not specified'}
        - Experience: ${profile.experience?.map(exp => `${exp.title} at ${exp.company} (${exp.duration})`).join('; ') || 'Not specified'}
        - Education: ${profile.education?.map(edu => `${edu.degree} from ${edu.institution} (${edu.year})`).join('; ') || 'Not specified'}
        - Preferred roles: ${profile.preferred_roles?.join(', ') || 'Not specified'}
        - Industry preferences: ${profile.industry_preferences?.join(', ') || 'Not specified'}
      `;
    }

    try {
      // Try to use Gemini API if API key is available
      if (process.env.REACT_APP_GEMINI_API_KEY) {
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

        const prompt = `
        Generate ${numJobs} job listings for the industry "${industry}" in the location "${location}".
        Make each job listing realistic, relevant, and specific to the industry and location.
        
        ${usingCvData ? cvContext : ''}
        ${usingCvData ? 'The job listings should match the job seeker\'s profile above.' : ''}
        
        For each job, include:
        - A relevant job title for the industry
        - A real company name that would exist in ${location} in the ${industry} industry
        - The location (${location})
        - A realistic salary range
        - Required experience level
        - Job type (Full-time, Part-time, Contract, etc.)
        - Today's date as the posting date
        - A URL for application (use placeholder example.com)
        - A detailed job description relevant to the position
        - 5 specific requirements for the role
        
        Return the results in this exact JSON format:
        [
          {
            "title": "Job Title",
            "company": "Company Name",
            "location": "City, State/Country",
            "salary_range": "$X - $Y",
            "experience_level": "Entry/Mid/Senior level",
            "job_type": "Full-time/Part-time/etc",
            "posted_date": "YYYY-MM-DD",
            "application_url": "https://example.com/apply",
            "description": "Detailed job description",
            "requirements": [
              "Requirement 1",
              "Requirement 2",
              "Requirement 3",
              "Requirement 4",
              "Requirement 5"
            ]
          }
        ]
        
        Ensure all data is realistic for the ${industry} industry in ${location}.
      `;

        try {
          const response = await axios.post(
            `${apiUrl}?key=${apiKey}`,
            {
              contents: [
                {
                  parts: [
                    {
                      text: prompt
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            }
          );

          // Extract text from response
          const generatedText = response.data.candidates[0].content.parts[0].text;

          // Clean up the response to get valid JSON
          const jsonStr = cleanJsonString(generatedText);

          // Parse the JSON
          let generatedJobs = JSON.parse(jsonStr);

          if (validateJobListings(generatedJobs)) {
            setJobListings(generatedJobs);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error("Error calling Gemini API:", apiError);
          // Fall through to fallback method
        }
      }

      // If API call fails or no API key, use enhanced fallback data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create job titles based on the CV analysis if available
      const createJobsFromCV = () => {
        if (!usingCvData || !cvAnalysis || !cvAnalysis.profile) {
          return createIndustrySpecificJobs();
        }

        const profile = cvAnalysis.profile;
        const fallbackStructure = FALLBACK_JOBS.map(job => ({ ...job }));

        // Use preferred roles from CV if available
        const preferredRoles = profile.preferred_roles || [];
        const skills = profile.skills || [];
        const technicalSkills = profile.technical_skills || [];

        // Determine job titles based on preferred roles or skills
        const jobTitles = preferredRoles.length > 0
          ? preferredRoles
          : skills.map(skill => `${skill} Specialist`).concat(technicalSkills.map(skill => `${skill} Professional`));

        // Generate company names based on industry and location
        const locationPrefix = location.split(',')[0].trim();

        // Today's date
        const today = new Date().toISOString().split('T')[0];

        // Create job requirements based on CV skills
        return fallbackStructure.map((job, index) => {
          const title = jobTitles[index % jobTitles.length];
          const companyPrefix = ['Tech', 'Digital', 'Cyber', 'Cloud', 'AI', 'Data', 'Innovation'][index % 7];
          const companyName = `${companyPrefix} ${locationPrefix} ${['Solutions', 'Group', 'Partners', 'Technologies', 'Innovations'][index % 5]}`;

          // Mix skills from CV with job requirements
          const allSkills = [...skills, ...technicalSkills];
          const requirements = allSkills.length > 0
            ? [
              `Proficiency in ${allSkills[index % allSkills.length]}`,
              `Experience with ${allSkills[(index + 1) % allSkills.length]}`,
              `Knowledge of ${allSkills[(index + 2) % allSkills.length]}`,
              `Understanding of ${industry} best practices`,
              `Strong communication and teamwork skills`
            ]
            : [
              `Experience in ${industry}`,
              `Knowledge of ${industry} best practices`,
              ...job.requirements.slice(0, 3)
            ];

          // Create description using CV details
          const expLevel = profile.experience && profile.experience.length > 1 ? 'Senior' : 'Mid-Level';
          const description = `Join our team at ${companyName} in ${location}! We are seeking a talented ${title} with experience in ${skills.slice(0, 3).join(', ')}. You will work on exciting projects and collaborate with a dynamic team.`;

          // Customize salary based on location and experience
          const salaryMultiplier = location.toLowerCase().includes('mumbai') ? 0.7 : 1;
          const expMultiplier = expLevel.includes('Senior') ? 1.3 : expLevel.includes('Mid') ? 1 : 0.8;
          const baseSalary = parseInt(job.salary_range.replace(/[^0-9]/g, '').substring(0, 6));
          const minSalary = Math.round((baseSalary * salaryMultiplier * expMultiplier) / 10000) * 10000;
          const maxSalary = Math.round((minSalary * 1.25) / 10000) * 10000;

          // Format depending on location
          let salaryRange = '';
          if (location.toLowerCase().includes('mumbai') || location.toLowerCase().includes('india')) {
            salaryRange = `₹${(minSalary / 10000).toFixed(1)}L - ₹${(maxSalary / 10000).toFixed(1)}L`;
          } else {
            salaryRange = `$${(minSalary / 1000).toFixed(0)}K - $${(maxSalary / 1000).toFixed(0)}K`;
          }

          return {
            ...job,
            title: title,
            company: companyName,
            location: location,
            salary_range: salaryRange,
            experience_level: expLevel.includes('Senior') ? 'Senior (5+ years)' : expLevel.includes('Mid') ? 'Mid-Level (3-5 years)' : 'Entry-Level (0-2 years)',
            posted_date: today,
            requirements: requirements,
            description: description
          };
        });
      };

      // Create industry-specific job titles based on the searched industry
      const createIndustrySpecificJobs = () => {
        // Base structure from fallback jobs
        const fallbackStructure = FALLBACK_JOBS.map(job => ({ ...job }));

        // Map of industries to job titles and company name formats
        const industryJobMap = {
          'technology': {
            titles: ['Full Stack Developer', 'DevOps Engineer', 'Cloud Architect', 'Mobile App Developer', 'IT Security Specialist'],
            companyPrefix: ['Tech', 'Digital', 'Cyber', 'Cloud', 'AI']
          },
          'healthcare': {
            titles: ['Medical Researcher', 'Clinical Data Analyst', 'Healthcare Administrator', 'Nurse Practitioner', 'Pharmaceutical Sales Rep'],
            companyPrefix: ['Health', 'Med', 'Care', 'Life', 'Wellness']
          },
          'finance': {
            titles: ['Financial Analyst', 'Investment Advisor', 'Risk Assessment Specialist', 'Fintech Developer', 'Compliance Officer'],
            companyPrefix: ['Finance', 'Capital', 'Invest', 'Asset', 'Wealth']
          },
          'marketing': {
            titles: ['Digital Marketing Specialist', 'Brand Manager', 'SEO Strategist', 'Content Marketing Lead', 'Social Media Director'],
            companyPrefix: ['Brand', 'Media', 'Market', 'Pulse', 'Engage']
          },
          'education': {
            titles: ['Curriculum Developer', 'Educational Consultant', 'E-Learning Designer', 'Academic Advisor', 'Education Technology Specialist'],
            companyPrefix: ['Edu', 'Learn', 'Academic', 'Knowledge', 'Teach']
          },
          'python': {
            titles: ['Python Developer', 'Python Backend Engineer', 'Machine Learning Engineer', 'Data Scientist', 'Python Automation Specialist'],
            companyPrefix: ['Py', 'Code', 'Data', 'AI', 'Tech'],
            requirements: [
              'Strong proficiency in Python programming',
              'Experience with popular Python frameworks like Django, Flask, or FastAPI',
              'Knowledge of data processing libraries (Pandas, NumPy)',
              'Understanding of RESTful APIs and web services',
              'Experience with database technologies (SQL, NoSQL)'
            ],
            descriptions: [
              'seeking an experienced Python Developer to join our growing team. You will design and implement high-quality Python applications, collaborate with cross-functional teams, and contribute to all stages of the software development lifecycle.',
              'looking for a talented Python Backend Engineer who will be responsible for developing and maintaining robust server-side applications using Python. You will work with databases, APIs, and focus on performance optimization.',
              'in need of a Machine Learning Engineer with strong Python skills to develop and implement machine learning models and algorithms. You will analyze large datasets, train models, and integrate them into production systems.',
              'seeking a Data Scientist with Python expertise to extract valuable insights from complex datasets, develop predictive models, and translate business requirements into data-driven solutions.',
              'looking for a Python Automation Specialist to create scripts and tools that streamline workflows and business processes. You will identify opportunities for automation and implement Python solutions to increase efficiency.'
            ]
          }
        };

        // Default for industries not in our map
        const defaultIndustry = {
          titles: ['Project Manager', 'Business Analyst', 'Operations Director', 'Research Specialist', 'Department Coordinator'],
          companyPrefix: ['Global', 'Premier', 'Advanced', 'Elite', 'Innovative']
        };

        // Find matching industry or use defaultIndustry
        // Check for exact match first, then partial match
        let industryKey = Object.keys(industryJobMap).find(key =>
          key.toLowerCase() === industry.toLowerCase()
        );

        if (!industryKey) {
          industryKey = Object.keys(industryJobMap).find(key =>
            industry.toLowerCase().includes(key) || key.toLowerCase().includes(industry.toLowerCase())
          );
        }

        const industryData = industryJobMap[industryKey] || defaultIndustry;

        // Today's date
        const today = new Date().toISOString().split('T')[0];

        // Customize each job
        return fallbackStructure.map((job, index) => {
          const title = industryData.titles[index % industryData.titles.length];
          const companyPrefix = industryData.companyPrefix[index % industryData.companyPrefix.length];

          // Generate a realistic company name based on industry and location
          const locationPrefix = location.split(',')[0].trim();
          const companyName = `${companyPrefix}${industry.charAt(0).toUpperCase() + industry.slice(1, 4)} ${locationPrefix} ${['Solutions', 'Group', 'Partners', 'Associates', 'Innovations'][index % 5]}`;

          // Custom description for specific industries
          let description = '';
          if (industryData.descriptions) {
            description = `Join our team at ${companyName} in ${location}! We are ${industryData.descriptions[index % industryData.descriptions.length]}`;
          } else {
            description = `Join our team at ${companyName} in ${location}! We are seeking a talented ${title} to help us innovate in the ${industry} industry. ${job.description}`;
          }

          // Custom requirements for specific industries
          let requirements = [];
          if (industryData.requirements) {
            // Mix industry-specific requirements with some generic ones
            requirements = [
              ...industryData.requirements.slice(0, 3),
              `Experience working in ${location}`,
              `Strong communication and teamwork skills`
            ];
          } else {
            requirements = [
              `Experience in ${industry}`,
              `Knowledge of ${industry} best practices`,
              ...job.requirements.slice(0, 3)
            ];
          }

          // Customize salary based on location
          const salaryMultiplier = location.toLowerCase().includes('mumbai') ? 0.7 : 1;
          const baseSalary = parseInt(job.salary_range.replace(/[^0-9]/g, '').substring(0, 6));
          const minSalary = Math.round((baseSalary * salaryMultiplier) / 10000) * 10000;
          const maxSalary = Math.round((minSalary * 1.25) / 10000) * 10000;

          // Format depending on location
          let salaryRange = '';
          if (location.toLowerCase().includes('mumbai') || location.toLowerCase().includes('india')) {
            salaryRange = `₹${(minSalary / 10000).toFixed(1)}L - ₹${(maxSalary / 10000).toFixed(1)}L`;
          } else {
            salaryRange = `$${(minSalary / 1000).toFixed(0)}K - $${(maxSalary / 1000).toFixed(0)}K`;
          }

          return {
            ...job,
            title: title,
            company: companyName,
            location: location,
            salary_range: salaryRange,
            posted_date: today,
            requirements: requirements,
            description: description
          };
        });
      };

      // Get customized jobs and filter to the requested number
      const customizedJobs = usingCvData
        ? createJobsFromCV().slice(0, numJobs)
        : createIndustrySpecificJobs().slice(0, numJobs);

      setJobListings(customizedJobs);

    } catch (err) {
      console.error("Error generating job listings:", err);
      setError("Error generating job listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format date from ISO to readable format
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (err) {
      return dateString;
    }
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MdWorkOutline className="mr-3 text-blue-500" />
            AI Job Board Generator
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Generate and view personalized job listings powered by AI
          </p>
        </div>

        {/* CV Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MdUploadFile className="mr-2 text-blue-500" />
            Upload Your CV for Personalized Job Recommendations
          </h2>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Upload your CV to get job recommendations tailored to your skills and experience
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex-1 flex flex-col items-center px-4 py-6 bg-blue-50 text-blue-500 rounded-lg border-2 border-dashed border-blue-300 cursor-pointer hover:bg-blue-100 transition-colors">
                <MdUploadFile className="text-3xl mb-2" />
                <span className="font-medium">Upload your CV (PDF)</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={cvLoading}
                />
              </label>

              <button
                onClick={useDemoCV}
                disabled={cvLoading}
                className="flex-1 sm:flex-initial bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 px-4 rounded-lg flex items-center justify-center"
              >
                <MdPersonSearch className="mr-2" />
                Use Demo CV
              </button>
            </div>

            {cvLoading && (
              <div className="mt-4 flex items-center text-blue-500">
                <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                Analyzing CV...
              </div>
            )}

            {cvError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {cvError}
              </div>
            )}

            {cvAnalysis && cvAnalysis.profile && (
              <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-md">
                <p className="font-medium">CV Analysis Complete</p>
                <p>Found {cvAnalysis.profile.skills?.length || 0} skills and {cvAnalysis.profile.technical_skills?.length || 0} technical skills.</p>
                <p className="mt-1">
                  Using <span className="font-semibold">{industry}</span> in <span className="font-semibold">{location}</span> for your job search.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Job Board Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Generate Job Listings</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <input
                type="text"
                id="industry"
                placeholder="e.g., Technology"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="numJobs" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Jobs
              </label>
              <select
                id="numJobs"
                value={numJobs}
                onChange={(e) => setNumJobs(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={generateJobListings}
            disabled={loading || !industry || !location}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                Generating Job Listings...
              </>
            ) : (
              <>
                <MdWorkOutline className="mr-2" />
                Generate Job Board
              </>
            )}
          </button>

          {usingCvData && cvAnalysis && (
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <MdPersonSearch className="mr-1" />
              Using your CV to personalize job recommendations
            </div>
          )}
        </div>

        {/* Job Listings */}
        {jobListings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Job Listings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobListings.map((job, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">
                      {job.title}
                    </h3>

                    <div className="flex items-center mb-2">
                      <FaBuilding className="text-gray-500 mr-2" />
                      <span className="text-gray-700 font-medium">{job.company}</span>
                    </div>

                    <div className="flex flex-wrap gap-y-2 text-sm text-gray-600 mb-4">
                      <div className="w-full sm:w-1/2 flex items-center">
                        <IoLocationOutline className="mr-1" />
                        {job.location}
                      </div>

                      <div className="w-full sm:w-1/2 flex items-center">
                        <FaMoneyBillWave className="mr-1" />
                        {job.salary_range}
                      </div>

                      <div className="w-full sm:w-1/2 flex items-center">
                        <FaClock className="mr-1" />
                        {job.job_type}
                      </div>

                      <div className="w-full sm:w-1/2 flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        Posted: {formatDate(job.posted_date)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <button
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium"
                      >
                        {job.experience_level}
                      </button>

                      {usingCvData && cvAnalysis && (
                        <button
                          className="ml-2 bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-medium"
                        >
                          CV Match
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-700 mb-2">
                        <span>View Details</span>
                        <span className="transition-transform group-open:rotate-180">
                          <svg fill="none" height="24" width="24" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </span>
                      </summary>

                      <div className="mt-2 text-gray-700">
                        <p className="mb-3">{job.description}</p>

                        <h4 className="font-semibold mb-2">Requirements:</h4>
                        <ul className="list-disc pl-5 mb-4">
                          {job.requirements.map((req, idx) => (
                            <li key={idx} className="mb-1">{req}</li>
                          ))}
                        </ul>

                        <a
                          href={job.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-blue-500 text-center text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Apply Now
                        </a>
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;