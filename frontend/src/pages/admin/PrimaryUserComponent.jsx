import React from "react";
import { User, Mail, Phone, Calendar, Shield, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ToggleSwitch from "./ToggleSwitch";

const PrimaryUserComponent = ({ primaryUser, onToggle, onSubscriptionToggle, isLoading }) => {
  // Helper function to get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Subscription Toggle Component
  const SubscriptionToggle = ({ subscriptionType, onToggle, loading = false }) => {
    const isYearly = subscriptionType === 'yearly';
    
    return (
      <div className="flex items-center space-x-3">
        <Shield size={20} className="text-gray-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Subscription</p>
          <div className="flex items-center space-x-3 mt-1">
            <span className={`text-lg font-semibold transition-colors ${!isYearly ? 'text-gray-800' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={onToggle}
              disabled={loading}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${
                isYearly ? 'bg-green-500' : 'bg-blue-500'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                  isYearly ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                </div>
              )}
            </button>
            <span className={`text-lg font-semibold transition-colors ${isYearly ? 'text-gray-800' : 'text-gray-400'}`}>
              Yearly
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 border-b border-gray-200">
      <div className="flex justify-center items-center mb-6 bg-gradient-to-br from-blue-500 to-purple-600">
        <Avatar className="h-16 w-18 transition-all duration-500">
          <AvatarImage 
            src="https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg" 
            className="transition-all duration-300 hover:scale-110"
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold transition-all duration-300 group-hover:from-blue-600 group-hover:to-purple-700">
            {getInitials(primaryUser?.name)}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User size={20} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Name</p>
                <p className="text-lg font-semibold text-gray-800">{primaryUser?.name || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-lg font-semibold text-gray-800">{primaryUser?.email || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone size={20} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                <p className="text-lg font-semibold text-gray-800">{primaryUser?.phoneNumber || "N/A"}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created</p>
                <p className="text-lg font-semibold text-gray-800">{formatDate(primaryUser?.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Expires</p>
                <p className="text-lg font-semibold text-gray-800">{formatDate(primaryUser?.expiredAt)}</p>
              </div>
            </div>
            <SubscriptionToggle
              subscriptionType={primaryUser?.subscriptionType}
              onToggle={onSubscriptionToggle}
              loading={isLoading}
            />
          </div>
        </div>
        
        {/* Toggle Controls */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between space-x-6">
            <ToggleSwitch
              enabled={primaryUser?.sms || false}
              onToggle={() => onToggle('primaryUser', null, 'sms', primaryUser?.sms)}
              label="SMS"
              loading={isLoading}
            />
          
<ToggleSwitch
  enabled={primaryUser?.whatsApp}
  onToggle={() => onToggle('primaryUser', null, 'whatsApp', primaryUser?.whatsApp)} // Changed 'whatsapp' to 'whatsApp'
  label="WhatsApp"
  loading={isLoading}
/>
            <ToggleSwitch
              enabled={!primaryUser?.isBlocked}
              onToggle={() => onToggle('primaryUser', null, 'isBlocked', primaryUser?.isBlocked)}
              label="isBlocked"
              loading={isLoading}
            />
            <ToggleSwitch
              enabled={primaryUser?.isApproved || false}
              onToggle={() => onToggle('primaryUser', null, 'isApproved', primaryUser?.isApproved)}
              label="isApproved"
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimaryUserComponent;