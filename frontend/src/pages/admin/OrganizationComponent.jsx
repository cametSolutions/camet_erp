/* eslint-disable react/prop-types */
import { truncateText } from '../../../../backend/utils/textHelpers';
import { industries } from '../../../constants/industries';
import { Building2, MapPin, Briefcase, } from 'lucide-react';

const ToggleSwitch = ({ enabled, onToggle, label, loading, tab }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={onToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? (tab === "block" ? "bg-blue-400" : "bg-green-400") : "bg-gray-200"
        } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};


const OrganizationCard = ({ org, onToggle, isLoading }) => {
  const getStatusColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'integrated':
        return 'bg-green-100 text-green-800';
      case 'self':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

    const getIndustryName = (industryCode) => {
      const industry = industries?.find(
        (industry) => industry?.code === industryCode
      );
      return industry?.industry || "";
    };



  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
<div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xl hover:shadow-md hover:translate-y-1 transition-all duration-200 ease-in-out">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-14 h-14  rounded-xl flex items-center justify-center text-white font-semibold text-sm bg-slate-100 border`}>
            {org.logo ? (
              <img src={org.logo} alt="Organization Logo" className=" object-cover rounded-full w-10 h-10 border border-gray-400" />
            ) : (
              <div className="flex items-center justify-center  bg-gray-700 rounded-full w-10 h-10">
                <span className="text-lg font-bold">{getInitials(org.name)}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              {  truncateText(org.name, 18) || 'No Organization'}
            </h3>
          </div>
        </div>
        
   
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(org.type)}`}>
          {org.type || 'N/A'}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-600">
          <MapPin size={16} className="mr-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-500 mr-2">Location:</span>
          <span className="text-sm font-semibold text-gray-900">
            {org.place || '-'}
          </span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Briefcase size={16} className="mr-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-500 mr-2">Industry:</span>
          <span className="text-sm font-semibold text-gray-900">
            {getIndustryName(org.industry) || '-'}
          </span>
        </div>
      </div>

      {/* Toggle Controls */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <ToggleSwitch
          enabled={!org.isBlocked}
          onToggle={() => onToggle('organization', org.id, 'isBlocked', org.isBlocked)}
          label="Active"
          loading={isLoading}
          tab="block"
        />
        <ToggleSwitch
          enabled={org.isApproved}
          onToggle={() => onToggle('organization', org.id, 'isApproved', org.isApproved)}
          label="Approved"
          loading={isLoading}
          tab="approve"

        />
      </div>
    </div>
  );
};

const OrganizationComponent = ({ organizations, onToggle, isLoading }) => {


  if (!organizations?.length) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No organization found for this user</p>
      </div>
    );
  }


  

  return (
    <div className=" bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6 max-w-7xl">
        {organizations.map((org, index) => (
          <OrganizationCard
            key={org.id || index}
            org={org}
            onToggle={onToggle}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default OrganizationComponent;