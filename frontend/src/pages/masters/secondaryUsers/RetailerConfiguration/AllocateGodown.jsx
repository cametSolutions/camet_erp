import TitleDiv from "@/components/common/TitleDiv";
import { truncateText } from "../../../../../../backend/utils/textHelpers.js";
import { useEffect, useState } from "react";
import {
  HiCheck,
  HiX,
  HiSparkles,
  HiOfficeBuilding,
  HiLocationMarker,
} from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/api/api.js";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AllocateGodown = () => {
  const [selectedGodowns, setSelectedGodowns] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.data?.userData?._id;
  
  // Check if this is van sale godown allocation
  const isVanSaleGodown = location.pathname.includes('/allocateVanSaleGodown');
  const pageTitle = isVanSaleGodown ? "Allocate Van Sale Godown" : "Allocate Godown";
  const subDetailParam = isVanSaleGodown ? "selectedVanSaleGodowns" : "selectedGodowns";
  const configKey = isVanSaleGodown ? "selectedVanSaleGodowns" : "selectedGodowns";

  // Check if userId exists, redirect if not
  useEffect(() => {
    if (!userId) {
      navigate(-1, { replace: true });
    }
  }, [userId, navigate]);

  // Fetch secondary user details
  const {
    data: userDetailsData,
    isLoading: userDetailsLoading,
    error: userDetailsError,
  } = useQuery({
    queryKey: ["secUserDetails", userId],
    queryFn: async () => {
      const response = await api.get(
        `/api/sUsers/getSecUserDetails/${userId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    enabled: !!userId, // Only fetch if userId exists
  });

  // Set default selected company when user details are loaded
  useEffect(() => {
    if (userDetailsData?.data?.userData?.organisation?.length > 0) {
      // Set the first organization as default if none is selected
      if (!selectedCompany) {
        setSelectedCompany(userDetailsData.data.userData.organisation[0]._id);
      }
    }
  }, [userDetailsData, selectedCompany]);

  // Fetch godowns data based on selected company
  const {
    data: godownsData,
    isLoading: godownsLoading,
    error: godownsError,
  } = useQuery({
    queryKey: ["godowns", selectedCompany],
    queryFn: async () => {
      const response = await api.get(
        `/api/sUsers/getProductSubDetails/${selectedCompany}?type=godown`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    enabled: !!userId && !!selectedCompany, // Only fetch if userId and selectedCompany exist
  });

  // Allocate godowns mutation
  const allocateMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.put(
        `/api/sUsers/allocateSubDetails/${selectedCompany}?subDetail=${subDetailParam}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      navigate(-1);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "An error occurred");
      console.error(error);
    },
    onSettled: () => {
      localStorage.removeItem("tempGodownData");
    },
  });

  // Set pre-selected godowns when user details are loaded
  useEffect(() => {
    const userGodowns = userDetailsData?.data?.godown || [];
    if (userGodowns) {
      setSelectedGodowns(userGodowns);
    }
  }, [userDetailsData]);

  // Reset selected godowns when company changes
  useEffect(() => {
    setSelectedGodowns([]);
  }, [selectedCompany]);

  const godownData = godownsData?.data || [];
  const isLoading = godownsLoading || userDetailsLoading;
  const hasError = godownsError || userDetailsError;
  const organisations = userDetailsData?.data?.organization || [];

  useEffect(() => {
    if (userDetailsData) {
      const configuration = userDetailsData?.data?.configurations?.find(
        (item) => item?.organization?.toString() === selectedCompany
      );

      const previouslySelectedGodowns = configuration?.[configKey] || [];
      setSelectedGodowns(previouslySelectedGodowns);
    }
  }, [userDetailsData, selectedCompany, configKey]);

  const handleGodownSelect = (godown) => {
    setSelectedGodowns((prev) => {
      const isSelected = prev.includes(godown._id);
      
      if (isVanSaleGodown) {
        // For van sale godown, only allow single selection
        if (isSelected) {
          return []; // Deselect if already selected
        } else {
          return [godown._id]; // Select only this godown
        }
      } else {
        // For regular godown, allow multiple selection
        if (isSelected) {
          return prev.filter((gd) => gd !== godown._id);
        } else {
          return [...prev, godown._id];
        }
      }
    });
  };

  const removeSelectedGodown = (godownId) => {
    setSelectedGodowns((prev) => prev.filter((gd) => gd !== godownId));
  };

  const isSelected = (godownId) => {
    return selectedGodowns.includes(godownId);
  };

  const handleSubmit = async () => {
   

    if (!selectedCompany) {
      toast.warning("Please select a company");
      return;
    }

    const formData = {
      userId,
      selectedItems: selectedGodowns,
      selectedCompany: selectedCompany,
      [configKey]: selectedGodowns,
    };
    allocateMutation.mutate(formData);
  };

  const clearAllSelections = () => {
    setSelectedGodowns([]);
  };

  const getSelectedCompanyName = () => {
    const company = organisations.find((org) => org._id === selectedCompany);
    return company?.name || "Select Company";
  };

  // Show error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 flex flex-col">
        <TitleDiv title={pageTitle} loading={false} />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600">
              {godownsError?.message ||
                userDetailsError?.message ||
                "Failed to load required data. Please try again."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getSelectedGodownName = (godownId) => {
    const godown = godownData.find((gd) => gd._id === godownId);
    return godown?.godown || "Unknown Godown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <TitleDiv
        title={pageTitle}
        loading={isLoading || allocateMutation.isPending}
      />
      <div className="max-w-7xl mx-auto p-6">
        {/* Company Selection */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border-white/20 p-6 border">
          <div className="flex items-center gap-3 mb-4">
            <HiOfficeBuilding className="text-2xl text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Select Company
            </h3>
          </div>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a company for configuration" />
            </SelectTrigger>
            <SelectContent>
              {organisations.map((org) => (
                <SelectItem key={org._id} value={org._id}>
                  <div className="flex items-center gap-2">
                    <HiOfficeBuilding className="text-sm text-gray-500" />
                    <span>{org.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCompany && (
            <p className="text-sm text-gray-600 mt-2">
              Configuring godowns for:{" "}
              <span className="font-semibold">{getSelectedCompanyName()}</span>
            </p>
          )}
        </div>

        {/* User Info Section */}
        {userDetailsData?.data?.userData && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-white/20 p-4 border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {isVanSaleGodown 
                ? "Allocating van sale godown to: " 
                : "Allocating godowns to: "}
              {userDetailsData.data.userData.name || "User"}
            </h3>
            <p className="text-sm text-gray-600">
              Current allocated {isVanSaleGodown ? "van sale godowns" : "godowns"}:{" "}
              {userDetailsData.data.userData.godown?.length || 0}
            </p>
          </div>
        )}

        {/* Show message if no company is selected */}
        {!selectedCompany && organisations.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <HiOfficeBuilding className="text-4xl mx-auto mb-2 text-amber-500" />
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              Select a Company
            </h3>
            <p className="text-amber-600">
              Please select a company from the dropdown above to view and
              allocate {isVanSaleGodown ? "van sale godowns" : "godowns"}.
            </p>
          </div>
        )}

        {/* Only show godown sections if a company is selected */}
        {selectedCompany && (
          <>
            {/* Selected Godowns Display */}
            <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-white/20 p-6 transition-all duration-300 border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Selected {isVanSaleGodown ? "Van Sale Godown" : "Godowns"} ({selectedGodowns.length})
                  {isVanSaleGodown && <span className="text-sm text-gray-500 font-normal">(Max: 1)</span>}
                </h2>
                {selectedGodowns.length > 0 && (
                  <button
                    onClick={clearAllSelections}
                    className="mt-2 sm:mt-0 text-sm text-gray-500 hover:text-red-500 transition-colors duration-200 flex items-center gap-1"
                  >
                    <HiX className="text-xs" />
                    Clear All
                  </button>
                )}
              </div>

              {selectedGodowns.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {selectedGodowns.map((godownId, index) => (
                    <div
                      key={godownId}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-gray-800 rounded-full text-sm font-medium shadow-lg transform hover:scale-105 transition-all duration-200 animate-in slide-in-from-left"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <HiCheck className="text-sm" />
                      <span title={getSelectedGodownName(godownId)}>
                        {truncateText(getSelectedGodownName(godownId), 20)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSelectedGodown(godownId);
                        }}
                        className="ml-1 hover:bg-green-200 rounded-full p-1 transition-colors duration-200"
                      >
                        <HiX className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <div className="text-center">
                    <HiLocationMarker className="text-4xl mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      No {isVanSaleGodown ? "van sale godown" : "godowns"} selected yet
                    </p>
                    <p className="text-xs mt-1">
                      Click on godown cards below to select {isVanSaleGodown ? "one" : "them"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Godown Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {!isLoading &&
                godownData.map((godown, index) => (
                  <div
                    key={godown._id}
                    onClick={() => handleGodownSelect(godown)}
                    className={`group relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 transform hover:-translate-y-1 animate-in slide-in-from-bottom ${
                      isSelected(godown._id)
                        ? "border-green-200"
                        : "border-white/30 hover:border-green-50"
                    }`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Selection Indicator */}
                    {isSelected(godown._id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-20">
                        <HiCheck className="text-white text-sm" />
                      </div>
                    )}

                    {/* Default Godown Badge */}
                    {godown.defaultGodown && (
                      <div className="absolute top-3 left-3 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium z-20">
                        Default
                      </div>
                    )}

                    <div className="relative p-4 z-10 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`p-2 rounded-xl transition-all duration-300 flex-shrink-0 border ${
                            isSelected(godown._id)
                              ? "bg-green-100 shadow-lg border-green-200"
                              : "bg-gray-100 group-hover:bg-green-100"
                          }`}
                        >
                          <HiLocationMarker className="w-7 h-7 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-gray-900 transition-colors duration-300 leading-tight ${
                              isSelected(godown._id) ? "text-green-900" : ""
                            }`}
                            title={godown.godown}
                          >
                            {truncateText(godown.godown, 18)}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between min-h-[20px] text-xs bg-slate-50 p-2 rounded">
                        <span className="text-gray-500 font-medium">
                          Status:
                        </span>
                        <span className="text-green-600 font-semibold text-right flex-1 ml-2">
                          {godown.defaultGodown ? "Default" : "Active"}
                        </span>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
            </div>

            {/* Action Buttons */}
            {!isLoading && godownData.length > 0 && (
              <div className="w-full mt-12 flex flex-col sm:flex-row justify-start gap-4">
                <button
                  onClick={clearAllSelections}
                  className="sm:w-1/2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  disabled={selectedGodowns.length === 0}
                >
                  <HiX className="text-sm" />
                  Clear Selection
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                 
                    !selectedCompany ||
                    allocateMutation.isPending
                  }
                  className={`sm:w-1/2 px-8 py-3 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-0.5 ${
                   
                    selectedCompany &&
                    !allocateMutation.isPending
                      ? "bg-pink-500 text-white hover:bg-pink-600 hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  }`}
                >
                  <HiSparkles className="text-sm" />
                  {allocateMutation.isPending
                    ? "Allocating..."
                    : `Allocate to Staff (${selectedGodowns.length})`}
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && godownData.length === 0 && selectedCompany && (
              <div className="mt-12 text-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12">
                  <HiLocationMarker className="text-6xl mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No {isVanSaleGodown ? "Van Sale Godowns" : "Godowns"} Found
                  </h3>
                  <p className="text-gray-500">
                    There are no {isVanSaleGodown ? "van sale godowns" : "godowns"} available for the selected
                    company.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllocateGodown;