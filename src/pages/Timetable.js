import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { FaCalendarAlt, FaTrophy, FaCoins, FaFire, FaCheckCircle, FaClock, FaBuilding } from 'react-icons/fa';
import { MdWorkOutline, MdAdd, MdDelete, MdEdit } from 'react-icons/md';
import { IoFlameSharp } from 'react-icons/io5';

// Demo data for gig tasks
const DEMO_TASKS = [
  {
    id: 1,
    title: "Website Development",
    client: "TechStart Inc.",
    date: "2023-04-01",
    timeSlot: "09:00-12:00",
    duration: 3,
    payment: 150,
    completed: true,
    points: 30,
    category: "Development"
  },
  {
    id: 2,
    title: "Logo Design",
    client: "Creative Agency",
    date: "2023-04-01",
    timeSlot: "14:00-16:00",
    duration: 2,
    payment: 80,
    completed: true,
    points: 20,
    category: "Design"
  },
  {
    id: 3,
    title: "Content Writing",
    client: "Blog Masters",
    date: "2023-04-02",
    timeSlot: "10:00-13:00",
    duration: 3,
    payment: 90,
    completed: false,
    points: 25,
    category: "Writing"
  },
  {
    id: 4,
    title: "App Testing",
    client: "MobileX",
    date: "2023-04-03",
    timeSlot: "13:00-15:00",
    duration: 2,
    payment: 70,
    completed: false,
    points: 15,
    category: "Testing"
  },
  {
    id: 5,
    title: "SEO Optimization",
    client: "Digital Marketing Pro",
    date: "2023-04-04",
    timeSlot: "09:00-11:00",
    duration: 2,
    payment: 100,
    completed: false,
    points: 20,
    category: "Marketing"
  }
];

// Achievements list
const ACHIEVEMENTS = [
  {
    id: 1,
    title: "Early Bird",
    description: "Complete 5 tasks before noon",
    icon: <FaClock className="text-yellow-500" size={20} />,
    progress: 3,
    target: 5,
    reward: 50
  },
  {
    id: 2,
    title: "Streak Master",
    description: "Complete tasks for 5 consecutive days",
    icon: <FaFire className="text-orange-500" size={20} />,
    progress: 2,
    target: 5,
    reward: 100
  },
  {
    id: 3,
    title: "Diversity Champion",
    description: "Complete tasks in 4 different categories",
    icon: <FaTrophy className="text-purple-500" size={20} />,
    progress: 2,
    target: 4,
    reward: 75
  }
];

// Levels configuration
const LEVELS = [
  { level: 1, points: 0, title: "Beginner" },
  { level: 2, points: 100, title: "Apprentice" },
  { level: 3, points: 250, title: "Professional" },
  { level: 4, points: 500, title: "Expert" },
  { level: 5, points: 1000, title: "Master" }
];

const TaskModal = ({ isOpen, onClose, onSave, task = null }) => {
  const initialTask = task || {
    id: Date.now(),
    title: "",
    client: "",
    date: new Date().toISOString().split('T')[0],
    timeSlot: "09:00-12:00",
    duration: 3,
    payment: 0,
    completed: false,
    points: 20,
    category: "Other"
  };

  const [formData, setFormData] = useState(initialTask);

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData(initialTask);
    }
  }, [task]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <MdDelete size={20} />
        </button>
        
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MdWorkOutline className="mr-2 text-blue-500" />
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  name="timeSlot"
                  placeholder="09:00-12:00"
                  value={formData.timeSlot}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment ($)
                </label>
                <input
                  type="number"
                  name="payment"
                  min="0"
                  value={formData.payment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Writing">Writing</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Testing">Testing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="completed"
                  checked={formData.completed}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Task Completed
              </label>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                {task ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Timetable = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  
  const totalPoints = tasks.filter(task => task.completed).reduce((sum, task) => sum + task.points, 0);
  const totalEarnings = tasks.filter(task => task.completed).reduce((sum, task) => sum + task.payment, 0);
  
  // Determine current level
  const currentLevel = LEVELS.reduce((prev, curr) => 
    totalPoints >= curr.points ? curr : prev, LEVELS[0]);
  
  // Calculate progress to next level
  const nextLevel = LEVELS.find(level => level.level > currentLevel.level) || currentLevel;
  const pointsToNextLevel = nextLevel.points - totalPoints;
  const progressPercentage = nextLevel !== currentLevel 
    ? ((totalPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100
    : 100;
  
  // Get tasks for selected date
  const tasksForSelectedDate = tasks.filter(task => task.date === selectedDate);
  
  // Format date helper
  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Navigate dates
  const changeDate = (daysToAdd) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + daysToAdd);
    setSelectedDate(date.toISOString().split('T')[0]);
  };
  
  // Handle task edit
  const handleEditTask = (task) => {
    setCurrentTask(task);
    setModalOpen(true);
  };
  
  // Handle task delete
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  // Handle task completion toggle
  const handleToggleComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Handle task save (create or update)
  const handleSaveTask = (taskData) => {
    if (tasks.some(t => t.id === taskData.id)) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === taskData.id ? taskData : task
      ));
    } else {
      // Add new task
      setTasks([...tasks, taskData]);
    }
  };
  
  // Open add task modal
  const handleAddTask = () => {
    setCurrentTask(null);
    setModalOpen(true);
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaCalendarAlt className="mr-3 text-blue-500" />
            Gig Work Timetable
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your gig work schedule and track your achievements
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Total Points</h3>
              <FaTrophy className="text-yellow-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold">{totalPoints}</p>
            <div className="mt-2">
              <div className="text-sm text-gray-500 flex justify-between">
                <span>Level {currentLevel.level}: {currentLevel.title}</span>
                <span>{pointsToNextLevel} pts to next level</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
              <FaCoins className="text-yellow-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold">${totalEarnings}</p>
            <p className="mt-2 text-sm text-gray-500">
              From {tasks.filter(t => t.completed).length} completed tasks
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Current Streak</h3>
              <FaFire className="text-orange-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold">2 days</p>
            <p className="mt-2 text-sm text-gray-500">
              Keep it up for bonus points!
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex justify-between">
              <h3 className="text-gray-500 text-sm font-medium">Next Reward</h3>
              <FaCoins className="text-yellow-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold">100 pts</p>
            <p className="mt-2 text-sm text-gray-500">
              Complete 3 more days streak
            </p>
          </div>
        </div>
        
        {/* Date Navigation */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => changeDate(-1)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              ← Previous
            </button>
            
            <h2 className="text-xl font-semibold">{formatDate(selectedDate)}</h2>
            
            <button 
              onClick={() => changeDate(1)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              Next →
            </button>
          </div>
        </div>
        
        {/* Tasks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <MdWorkOutline className="mr-2 text-blue-500" />
                  Tasks for {formatDate(selectedDate)}
                </h2>
                <button
                  onClick={handleAddTask}
                  className="flex items-center justify-center bg-blue-500 text-white rounded-lg px-3 py-1.5 text-sm hover:bg-blue-600 transition-colors"
                >
                  <MdAdd className="mr-1" />
                  Add Task
                </button>
              </div>
              
              {tasksForSelectedDate.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks scheduled for this day</p>
                  <button
                    onClick={handleAddTask}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                  >
                    Add your first task
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasksForSelectedDate.map(task => (
                    <div 
                      key={task.id} 
                      className={`border rounded-lg p-4 ${task.completed ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleComplete(task.id)}
                              className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div>
                              <h3 className={`font-medium ${task.completed ? 'text-blue-700 line-through' : 'text-gray-900'}`}>
                                {task.title}
                              </h3>
                              <div className="flex flex-wrap mt-1 text-sm text-gray-500">
                                <span className="mr-3 flex items-center">
                                  <FaBuilding className="mr-1" /> {task.client}
                                </span>
                                <span className="mr-3 flex items-center">
                                  <FaClock className="mr-1" /> {task.timeSlot}
                                </span>
                                <span className="mr-3 flex items-center">
                                  <FaCoins className="mr-1 text-yellow-500" /> ${task.payment}
                                </span>
                                <span className="flex items-center">
                                  <FaTrophy className="mr-1 text-yellow-500" /> {task.points} pts
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="text-gray-400 hover:text-blue-500"
                          >
                            <MdEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <MdDelete size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Achievements Section */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FaTrophy className="mr-2 text-yellow-500" />
                Achievements
              </h2>
              
              <div className="space-y-4">
                {achievements.map(achievement => (
                  <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="mr-3">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {achievement.description}
                        </p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress: {achievement.progress}/{achievement.target}</span>
                            <span>Reward: {achievement.reward} pts</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Daily Streak */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <IoFlameSharp className="mr-2 text-orange-500" />
                  Daily Streak
                </h3>
                
                <div className="flex justify-between">
                  {Array.from({length: 7}, (_, i) => {
                    const isCompleted = i < 2;  // First 2 days completed
                    const isToday = i === 2;    // Today is the 3rd day
                    
                    return (
                      <div 
                        key={i}
                        className={`flex flex-col items-center ${isToday ? 'text-blue-600' : 'text-gray-500'}`}
                      >
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 
                          ${isCompleted ? 'bg-orange-500 text-white' : 
                            isToday ? 'border-2 border-blue-500' : 'bg-gray-200'}`}
                        >
                          {isCompleted ? (
                            <FaCheckCircle />
                          ) : (
                            i + 1
                          )}
                        </div>
                        <span className="text-xs">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                    <p className="text-orange-800 flex items-center">
                      <IoFlameSharp className="mr-2 text-orange-500" />
                      <span>Complete a task today to continue your streak!</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Task Modal */}
      <TaskModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        task={currentTask}
      />
    </div>
  );
};

export default Timetable; 