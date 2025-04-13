import React from 'react';
import { useAuth } from '../context/auth';
import { useGetUserProfileQuery, useGetLoginHistoryQuery } from '../store/apis/authApi';
import { format } from 'date-fns';

const Profile = () => {
  const { currentUser } = useAuth();
  const { data: userProfile, isLoading: profileLoading } = useGetUserProfileQuery();
  const { data: loginHistory, isLoading: historyLoading } = useGetLoginHistoryQuery();
  
  if (profileLoading || historyLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">User Profile</h1>
        
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* User Info */}
          <div className="w-full md:w-1/3">
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              {currentUser?.picture ? (
                <img 
                  src={currentUser.picture} 
                  alt={currentUser.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 text-4xl font-bold mb-4">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-800">{currentUser?.name}</h2>
              <p className="text-gray-600 mb-2">{currentUser?.email}</p>
              <p className="text-sm text-gray-500">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {currentUser?.provider === 'google' ? 'Google Account' : 'Email Account'}
                </span>
              </p>
            </div>
          </div>
          
          {/* Login History */}
          <div className="w-full md:w-2/3">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Login History</h2>
            
            {loginHistory && loginHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-500">Date & Time</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-500">IP Address</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-500">Device</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loginHistory.map((login, index) => {
                      const date = new Date(login.timestamp);
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-4 text-sm text-gray-700">
                            {format(date, 'MMM d, yyyy h:mm a')}
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-700">{login.ipAddress}</td>
                          <td className="py-2 px-4 text-sm text-gray-700">
                            {login.userAgent ? login.userAgent.substring(0, 50) + '...' : 'Unknown'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No login history available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
