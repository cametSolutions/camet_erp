import React from "react";
import { Users } from "lucide-react";
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
      md: "w-16 h-16 text-lg",
      lg: "w-20 h-20 text-xl",
      xl: "w-24 h-24 text-2xl"
    };
    
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg border-4 border-white`}>
        {getInitials(user?.name)}
      </div>
    );
  };

  if (!secondaryUsers?.length) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No secondary users found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {secondaryUsers.map((user, index) => (
        <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <UserAvatar user={user} size="sm" />
            <div>
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.mobile && <p className="text-sm text-gray-500">{user.mobile}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-4">
             {/* <ToggleSwitch
                enabled={Boolean(user.sms)} // Ensure boolean
                onToggle={() => {
                  console.log('SMS toggle clicked for user:', user.id, 'current value:', user.sms);
                  onToggle('secondaryUser', index, 'sms', user.sms);
                }}
                label="SMS"
                loading={isLoading}
              />
              <ToggleSwitch
                enabled={Boolean(user.whatsapp)} // Ensure boolean
                onToggle={() => {
                  console.log('WhatsApp toggle clicked for user:', user.id, 'current value:', user.whatsapp);
                  onToggle('secondaryUser', index, 'whatsapp', user.whatsapp);
                }}
                label="WhatsApp"
                loading={isLoading}
              /> */}
              <ToggleSwitch
                enabled={Boolean(user.isBlocked)} // Ensure boolean and invert logic
                onToggle={() => {
                  console.log('Active toggle clicked for user:', user.id, 'current isBlocked:', user.isBlocked);
                  onToggle('secondaryUser', index, 'isBlocked', user.isBlocked);
                }}
                label="isBlocked"
                loading={isLoading}
              />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecondaryUsersComponent;