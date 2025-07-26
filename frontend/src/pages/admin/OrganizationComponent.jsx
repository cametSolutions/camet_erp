import React from "react";
import { Building2, MapPin, Calendar, Shield } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

const OrganizationComponent = ({ organizations, onToggle, isLoading }) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!organizations?.length) {
    return (
      <div className="text-center py-8">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No organization found for this user</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {organizations.map((org, index) => (
        <div
          key={org.id || index}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
        >
          <div className="flex items-center text-xs space-x-4 mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg border-4 border-white">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{org?.name || "No Organization"}</h3>
              <p className="text-blue-600 font-medium">{org?.type || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Location</p>
                  <p className="text-lg font-semibold text-gray-800">{org?.place || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Building2 size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Type</p>
                  <p className="text-lg font-semibold text-gray-800">{org?.type || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Industry</p>
                  <p className="text-lg font-semibold text-gray-800">{org?.industry || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created</p>
                  <p className="text-lg font-semibold text-gray-800">{formatDate(org?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex-1">
              <ToggleSwitch
                enabled={org.isBlocked}
                onToggle={() => onToggle('organization', org.id, 'isBlocked', org.isBlocked)}
                label="Active"
                loading={isLoading}
              />
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex-1">
              <ToggleSwitch
                enabled={org.isApproved}
                onToggle={() => onToggle('organization', org.id, 'isApproved', org.isApproved)}
                label="Approved"
                loading={isLoading}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrganizationComponent;