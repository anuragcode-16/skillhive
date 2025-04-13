import { useState } from 'react';
import Link from '../features/Link';
import { useAuth } from '../context/auth';
import GoogleAuthButton from './GoogleAuthButton';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdOutlineLogout } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { MdContentCopy } from 'react-icons/md';
import { RiQrCodeLine } from 'react-icons/ri';
import { FaPodcast } from 'react-icons/fa';
import { MdWorkOutline } from 'react-icons/md';
import { FaCalendarAlt } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import Searchbar from './Searchbar';
import { FaSearch } from 'react-icons/fa';

const navLinks = [
  {
    path: '/dashboard',
    name: 'Dashboard'
  },
  {
    path: '/about',
    name: 'About'
  },
  {
    path: '/learning',
    name: 'Learning'
  },
  {
    path: '/podcasts',
    name: 'Podcasts'
  },
  {
    path: '/jobs',
    name: 'Jobs'
  },
  {
    path: '/timetable',
    name: 'Timetable'
  },
  {
    path: '/admin',
    name: 'Admin',
    adminOnly: true  // Only show for admin users
  }
];

// Mock notifications for demo
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "New Task Available",
    message: "A new high-paying task is available in your area!",
    time: "10 minutes ago",
    unread: true,
    type: "task"
  },
  {
    id: 2,
    title: "Achievement Unlocked!",
    message: "You've completed 5 tasks this week - Level Up!",
    time: "2 hours ago",
    unread: true,
    type: "achievement"
  },
  {
    id: 3,
    title: "Weekly Bonus",
    message: "Complete 3 more tasks to earn a 15% bonus!",
    time: "1 day ago",
    unread: false,
    type: "bonus"
  },
  {
    id: 4,
    title: "Reminder",
    message: "Don't forget your scheduled task at 3PM today",
    time: "5 hours ago",
    unread: false,
    type: "reminder"
  }
];

// Common support questions
const COMMON_QUESTIONS = [
  "I need help with my quiz results",
  "How do I update my CV?",
  "I can't see my personalized recommendations",
  "The video recommendations aren't loading",
  "I need help with my account settings"
];

// Dummy WhatsApp number - replace with a real one if needed
const WHATSAPP_NUMBER = '+91 8777021315';
const DEFAULT_MESSAGE = 'Hi, I need help with SkillHive!';

// Notification Component
const NotificationPanel = ({ isOpen, onClose, notifications, onMarkAsRead }) => {
  if (!isOpen) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return <MdWorkOutline className="text-blue-500" />;
      case 'achievement':
        return <FaCalendarAlt className="text-green-500" />;
      case 'bonus':
        return <MdContentCopy className="text-yellow-500" />;
      case 'reminder':
        return <IoNotificationsOutline className="text-red-500" />;
      default:
        return <IoNotificationsOutline className="text-gray-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-gray-700">Notifications</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <IoMdClose size={20} />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50' : ''}`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`font-medium ${notification.unread ? 'text-blue-600' : 'text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-gray-500 ml-2">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                </div>
                {notification.unread && (
                  <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 border-t text-center">
        <button 
          onClick={() => onMarkAsRead('all')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
};

// WhatsApp Modal Component
const WhatsAppModal = ({ isOpen, onClose, onSubmit }) => {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [category, setCategory] = useState('general');
  const [name, setName] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedMessage = `Name: ${name || 'User'}\nCategory: ${category}\nMessage: ${message}`;
    onSubmit(formattedMessage);
    onClose();
  };
  
  const selectQuickQuestion = (question) => {
    setMessage(question);
  };
  
  const getWhatsAppUrl = () => {
    const formattedMessage = `Name: ${name || 'User'}\nCategory: ${category}\nMessage: ${message}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(formattedMessage)}`;
  };
  
  const copyWhatsAppLink = () => {
    navigator.clipboard.writeText(getWhatsAppUrl()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <IoMdClose size={24} />
        </button>
        
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaWhatsapp className="text-green-500 text-3xl mr-3" />
            <h2 className="text-xl font-semibold">Contact Support via WhatsApp</h2>
          </div>
          
          {showQR ? (
            <div className="text-center py-4">
              <h3 className="font-medium mb-4">Scan this QR code with your phone</h3>
              <div className="bg-white p-4 rounded-lg shadow-inner mx-auto w-48 h-48 flex items-center justify-center mb-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getWhatsAppUrl())}`} 
                  alt="WhatsApp QR Code"
                  className="max-w-full"
                />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Or copy this link:</span>
                <button 
                  onClick={copyWhatsAppLink}
                  className="text-blue-500 hover:text-blue-700 flex items-center"
                >
                  <MdContentCopy />
                  {copied ? <span className="ml-1 text-green-500">Copied!</span> : null}
                </button>
              </div>
              <button
                onClick={() => setShowQR(false)}
                className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Form
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="general">General Question</option>
                  <option value="technical">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="account">Account Issues</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Common Questions</label>
                <div className="grid grid-cols-1 gap-2 mb-2">
                  {COMMON_QUESTIONS.map((question, index) => (
                    <button
                      key={index}
                      type="button"
                      className="text-left text-sm px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-blue-300 transition-colors"
                      onClick={() => selectQuickQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Your Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Describe your issue or question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaWhatsapp className="mr-2" />
                  Continue to WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setShowQR(true)}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <RiQrCodeLine className="mr-2" />
                  Show QR Code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ onSearch }) => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(MOCK_NOTIFICATIONS.filter(n => n.unread).length);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Check if user has admin privileges - in a real app, this would be part of the user object
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@example.com');
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openWhatsAppModal = () => {
    setIsWhatsAppModalOpen(true);
  };

  const closeWhatsAppModal = () => {
    setIsWhatsAppModalOpen(false);
  };

  const redirectToWhatsApp = (message) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };
  
  const toggleNotificationPanel = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
    // Close other panels
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };
  
  const markNotificationAsRead = (id) => {
    if (id === 'all') {
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    } else {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, unread: false } : n
      ));
    }
  };
  
  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
    // Implement search functionality or pass to parent component
    if (onSearch) {
      onSearch(searchTerm);
    }
  };
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsNotificationPanelOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <>
    <div className="flex flex-row justify-between items-center bg-gradient-to-r to-blue-400 via-blue-600 from-gray-900 py-3 px-5 w-full">
      <div className="font-bold text-xl md:text-3xl text-slate-200">
          <Link to={currentUser ? '/dashboard' : '/'}>Skill Hive</Link>
        </div>
        
        {/* Search Bar for larger screens */}
        <div className="hidden md:block mx-4 flex-grow max-w-xl">
          {currentUser && <Searchbar onSearch={handleSearch} placeholder="Search across SkillHive..." />}
      </div>
        
      <nav className="flex flex-row items-center gap-1 sm:gap-2 md:gap-4 font-medium text-white text-xs sm:text-sm md:text-base">
          {/* Show nav links only if user is logged in */}
          {currentUser && navLinks
            .filter(link => !link.adminOnly || (link.adminOnly && isAdmin))
            .map((link, index) => (
            <Link 
              key={index} 
              to={link.path} 
              className="px-1 sm:px-2 hover:text-blue-200 transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {/* Search toggle for mobile */}
          {currentUser && (
            <button
              onClick={toggleSearch}
              className="md:hidden flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1.5 transition-colors"
              title="Search"
            >
              <FaSearch className="text-lg" />
            </button>
          )}

          {/* Notification Button */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={toggleNotificationPanel}
                className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1.5 transition-colors"
                title="Notifications"
              >
                <IoNotificationsOutline className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <NotificationPanel 
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
              />
            </div>
          )}

          {/* WhatsApp Contact Button */}
          <button
            onClick={openWhatsAppModal}
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 transition-colors"
            title="Contact Support via WhatsApp"
          >
            <FaWhatsapp className="mr-1.5 text-lg" />
            <span className="hidden sm:inline">Support</span>
          </button>

          {currentUser ? (
            <div className="relative">
              <button 
                onClick={toggleMenu}
                className="flex items-center justify-center bg-blue-700 rounded-full p-1 hover:bg-blue-800 transition-colors duration-200"
              >
                {currentUser.picture ? (
                  <img 
                    src={currentUser.picture} 
                    alt={currentUser.name} 
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                ) : (
                  <IoPersonCircleOutline className="w-8 h-8 text-white" />
                )}
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <MdOutlineLogout className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <GoogleAuthButton 
                buttonText="Sign in" 
                className="py-1 px-3 text-xs sm:text-sm"
              />
            </div>
          )}
      </nav>
    </div>
      
      {/* Mobile search panel */}
      {isSearchOpen && currentUser && (
        <div className="md:hidden p-3 bg-blue-100">
          <Searchbar onSearch={handleSearch} placeholder="Search across SkillHive..." />
        </div>
      )}
      
      {/* WhatsApp Contact Modal */}
      <WhatsAppModal 
        isOpen={isWhatsAppModalOpen}
        onClose={closeWhatsAppModal}
        onSubmit={redirectToWhatsApp}
      />
    </>
  );
};

export default Navbar; 