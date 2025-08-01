/* eslint-disable react/prop-types */
import { Users, Mail, Phone } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

const SecondaryUsersComponent = ({ secondaryUsers, onToggle, isLoading }) => {
  // Helper function to get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // User avatar component
  const UserAvatar = ({ user, size = "lg" }) => {
    const sizeClasses = {
      sm: "w-12 h-12 text-sm",
      md: "w-14 h-14 text-base",
      lg: "w-16 h-16 text-lg",
      xl: "w-20 h-20 text-xl"
    };
    
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-600 flex items-center justify-center text-white font-bold`}>
        {getInitials(user?.name)}
      </div>
    );
  };

  if (!secondaryUsers?.length) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No secondary users found</h3>
        <p className="text-gray-500">Secondary users will appear here when added.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      

      {/* Users list */}
      <div className="space-y-3">
        {secondaryUsers.map((user, index) => (
          <div 
            key={user.id} 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              {/* User info section */}
              <div className="flex items-center space-x-4 flex-1">
                <UserAvatar user={user} size="md" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      user?.isBlocked 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {user?.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {user.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    {user.mobile && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{user.mobile}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls section */}
              <div className="flex items-center ml-4">
           
                <ToggleSwitch
                  enabled={Boolean(!user.isBlocked)}
                  onToggle={() => {
                    onToggle('secondaryUser', index, 'isBlocked', user.isBlocked);
                  }}
                  // label="isBlocked"
                  loading={isLoading}
                />
              </div>
            </div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecondaryUsersComponent;