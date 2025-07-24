import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Users, Loader2, XCircle } from "lucide-react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import PrimaryUserComponent from "./PrimaryUserComponent";
import OrganizationComponent from "./OrganizationComponent";
import SecondaryUsersComponent from "./SecondaryUsersComponent";

const ProfileCard = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('organization');
  const queryClient = useQueryClient();
 const capacityOptions = Array.from({ length: 100 }, (_, i) => i + 1);
  // Fetch profile data using React Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['primaryUserProfile', userId],
    queryFn: async () => {
      const response = await api.get(`/api/admin/getPrimaryUserProfileById/${userId}`, {
        withCredentials: true
      });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Mutations for updating user status
  const primaryUserMutation = useMutation({
    mutationFn: async ({ field, value }) => {
      const response = await api.patch(`/api/admin/updatePrimaryUserStatus/${userId}`, {
        field,
        value
      }, {
        withCredentials: true
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['primaryUserProfile', userId]);
      // toast.success('Primary user status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating primary user:', error);
      toast.error(error.response?.data?.message || 'Failed to update primary user');
    }
  });


   const capacityMutation = useMutation({
    mutationFn: async ({ field, value }) => {
      const response = await api.patch(`/api/admin/updateUserCapacity/${userId}`, {
        field,
        value
      }, {
        withCredentials: true
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['primaryUserProfile', userId]);
      const fieldName = variables.field === 'organizationLimit' ? 'Organization' : 'Secondary User';
      toast.success(`${fieldName} capacity updated successfully`);
    },
    onError: (error) => {
      console.error('Error updating capacity:', error);
      toast.error(error.response?.data?.message || 'Failed to update capacity');
    }
  });
  const organizationMutation = useMutation({
    mutationFn: async ({ id, field, value }) => {
      console.log('Organization ID:', id);
      console.log('Field:', field, 'Value:', value);
      
      if (!id) {
        throw new Error('Organization ID is required');
      }
      
      const response = await api.patch(`/api/admin/updateOrganizationStatus/${id}`, {
        field,
        value
      }, {
        withCredentials: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Success:', data);
      queryClient.invalidateQueries(['primaryUserProfile', userId]);
      // toast.success('Organization status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating organization:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update organization');
    }
  });

  const secondaryUserMutation = useMutation({
    mutationFn: async ({ secondaryUserId, field, value }) => {
      const response = await api.patch(`/api/admin/updateSecondaryUserStatus/${secondaryUserId}`, {
        field,
        value
      }, {
        withCredentials: true
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['primaryUserProfile', userId]);
      // toast.success('Secondary user status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating secondary user:', error);
      toast.error(error.response?.data?.message || 'Failed to update secondary user');
    }
  });


  const handleCapacityChange = useCallback(async (field, value) => {
    const numericValue = parseInt(value, 10);
    
    if (numericValue < 1 || numericValue > 100) {
      toast.error('Capacity must be between 1 and 100');
      return;
    }

    try {
      await capacityMutation.mutateAsync({
        field,
        value: numericValue
      });
    } catch (error) {
      console.error('Capacity update failed:', error);
    }
  }, [capacityMutation]);

  // Handle toggle changes
  const handleToggle = useCallback(async (type, index, field, currentValue) => {
    const newValue = !currentValue;
    console.log('Toggle called:', { type, index, field, currentValue, newValue });
    
    try {
      if (type === 'primaryUser') {
        await primaryUserMutation.mutateAsync({ field, value: newValue });
      } else if (type === 'organization') {
        if (!index) {
          toast.error('Organization ID not found');
          return;
        }
        
        console.log('Updating organization with ID:', index);
        await organizationMutation.mutateAsync({ 
          id: index, 
          field, 
          value: newValue 
        });
      } else if (type === 'secondaryUser') {
        const secondaryUser = data.secondaryUsers[index];
        if (!secondaryUser?.id) {
          toast.error('Secondary user not found');
          return;
        }
        await secondaryUserMutation.mutateAsync({ 
          secondaryUserId: secondaryUser.id, 
          field, 
          value: newValue 
        });
      }
    } catch (error) {
      console.error('Toggle update failed:', error);
    }
  }, [data, primaryUserMutation, organizationMutation, secondaryUserMutation]);

  // Handle subscription type toggle
  const handleSubscriptionToggle = useCallback(async () => {
    const currentType = data?.primaryUser?.subscriptionType;
    const newType = currentType === 'yearly' ? 'monthly' : 'yearly';
    
    
    try {
      await primaryUserMutation.mutateAsync({ 
        field: 'subscriptionType', 
        value: newType 
      });
    } catch (error) {
      console.error('Subscription toggle failed:', error);
    }
  },[data?.primaryUser?.subscriptionType, primaryUserMutation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-4">{error?.response?.data?.message || error?.message || 'Something went wrong'}</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { primaryUser, organization, secondaryUsers } = data || {};
  
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Primary User Section */}
      <PrimaryUserComponent 
        primaryUser={primaryUser}
        onToggle={handleToggle}
        onSubscriptionToggle={handleSubscriptionToggle}
        isLoading={primaryUserMutation.isPending}
      />

      {/* Tab Navigation */}
     <div className="p-8 pt-0 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Capacity Dropdown */}
          <div className="space-y-2">
            <label htmlFor="org-capacity" className="block text-sm font-medium text-gray-700">
              Organization Member Limit
            </label>
            <select
              id="org-capacity"
              value={primaryUser?.organizationLimit || ''}
              onChange={(e) => handleCapacityChange('organizationLimit', e.target.value)}
              disabled={capacityMutation.isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select capacity...</option>
              {capacityOptions.map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'member' : 'members'}
                </option>
              ))}
            </select>
            {capacityMutation.isPending && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Updating...
              </div>
            )}
          </div>

          {/* Secondary User Capacity Dropdown */}
          <div className="space-y-2">
            <label htmlFor="secondary-capacity" className="block text-sm font-medium text-gray-700">
              Secondary User Limit
            </label>
            <select
              id="secondary-capacity"
              value={primaryUser?.secondaryUserLimit || ''}
              onChange={(e) => handleCapacityChange('secondaryUserLimit', e.target.value)}
              disabled={capacityMutation.isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select capacity...</option>
              {capacityOptions.map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'user' : 'users'}
                </option>
              ))}
            </select>
            {capacityMutation.isPending && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Updating...
              </div>
            )}
          </div>
        </div>

        {/* Current Usage Display */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Current Organizations</span>
              <span className="text-lg font-bold text-blue-900">
                {Array.isArray(organization) ? organization.length : (organization ? 1 : 0)}
                {primaryUser?.organizationLimit && ` / ${primaryUser.organizationLimit}`}
              </span>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-700">Current Secondary Users</span>
              <span className="text-lg font-bold text-purple-900">
                {secondaryUsers?.length || 0}
                {primaryUser?.secondaryUserLimit && ` / ${primaryUser.secondaryUserLimit}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="p-8 pt-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg text-base">
          <button
            onClick={() => setActiveTab('organization')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'organization'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 size={18} />
            <span>Organization</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={18} />
            <span>Secondary Users</span>
            {/* <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-bold"> */}
              {/* {secondaryUsers?.length || 0} */}
            {/* </span> */}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-3">
          {activeTab === 'organization' && (
            <OrganizationComponent 
              organizations={organization}
              onToggle={handleToggle}
              isLoading={organizationMutation.isPending}
            />
          )}

          {activeTab === 'users' && (
            <SecondaryUsersComponent 
              secondaryUsers={secondaryUsers}
              onToggle={handleToggle}
              isLoading={secondaryUserMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;