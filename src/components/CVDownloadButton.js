import { useState } from 'react';
import { downloadCV } from '../api/cvManager';

const CVDownloadButton = ({ userId, userName, buttonText = 'Download CV', className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showFormats, setShowFormats] = useState(false);
  
  const handleDownload = async (format = 'pdf') => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await downloadCV(userId, format);
      
      // In a real app, this would trigger a file download
      // For demo purposes, we'll just show a success message
      console.log('CV download result:', result);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
      
      // Hide the format options
      setShowFormats(false);
    } catch (error) {
      console.error('Error downloading CV:', error);
      setError('Failed to download CV. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const baseClasses = 'relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  
  const buttonClasses = className || `${baseClasses} text-white bg-blue-600 hover:bg-blue-700`;
  
  return (
    <div className="relative">
      <button
        className={buttonClasses}
        onClick={() => setShowFormats(!showFormats)}
        disabled={loading}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        {buttonText}
      </button>
      
      {showFormats && (
        <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={() => handleDownload('pdf')}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Download as PDF
            </button>
            <button
              onClick={() => handleDownload('docx')}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Download as DOCX
            </button>
            <button
              onClick={() => handleDownload('json')}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Download as JSON
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-red-100 p-2 text-xs text-red-800">
          {error}
        </div>
      )}
      
      {success && (
        <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-green-100 p-2 text-xs text-green-800">
          CV for {userName || 'user'} downloaded successfully!
        </div>
      )}
    </div>
  );
};

export default CVDownloadButton; 