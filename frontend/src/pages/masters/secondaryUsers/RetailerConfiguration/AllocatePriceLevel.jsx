import TitleDiv from "@/components/common/TitleDiv";
import { truncateText } from "../../../../../../backend/utils/textHelpers.js";
import { useEffect, useState } from "react";
import {
  HiCheck,
  HiX,
  HiSparkles,
  HiTag,
  HiOfficeBuilding,
} from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/api/api.js";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AllocatePriceLevel = () => {
  const [selectedPriceLevels, setSelectedPriceLevels] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.data?.userData?._id;

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

  // Fetch price levels data based on selected company
  const {
    data: priceLevelsData,
    isLoading: priceLevelsLoading,
    error: priceLevelsError,
  } = useQuery({
    queryKey: ["priceLevels", selectedCompany],
    queryFn: async () => {
      const response = await api.get(
        `/api/sUsers/getProductSubDetails/${selectedCompany}?type=pricelevel`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    enabled: !!userId && !!selectedCompany, // Only fetch if userId and selectedCompany exist
  });

  // Allocate price levels mutation
  const allocateMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.put(
        `/api/sUsers/allocateSubDetails/${selectedCompany}?subDetail=selectedPriceLevels`,
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
      localStorage.removeItem("tempPriceLevelData");
    },
  });

  // Set pre-selected price levels when user details are loaded
  useEffect(() => {
    const userPriceLevels = userDetailsData?.data?.pricelevel || [];
    if (userPriceLevels) {
      setSelectedPriceLevels(userPriceLevels);
    }
  }, [userDetailsData]);

  // Reset selected price levels when company changes
  useEffect(() => {
    setSelectedPriceLevels([]);
  }, [selectedCompany]);

  const priceLevelData = priceLevelsData?.data || [];
  const isLoading = priceLevelsLoading || userDetailsLoading;
  const hasError = priceLevelsError || userDetailsError;
  const organisations = userDetailsData?.data?.organization || [];

  useEffect(() => {
    if (userDetailsData) {
      const configuration = userDetailsData?.data?.configurations?.find(
        (item) => item?.organization?.toString() === selectedCompany
      );

      const previouslySelectedPriceLevels =
        configuration?.selectedPriceLevels || [];
      setSelectedPriceLevels(previouslySelectedPriceLevels);
    }
  }, [userDetailsData, selectedCompany]);

  const handlePriceLevelSelect = (priceLevel) => {
    setSelectedPriceLevels((prev) => {
      const isSelected = prev.includes(priceLevel._id);
      if (isSelected) {
        return prev.filter((pl) => pl !== priceLevel._id);
      } else {
        return [...prev, priceLevel._id];
      }
    });
  };

  const removeSelectedPriceLevel = (priceLevelId) => {
    setSelectedPriceLevels((prev) => prev.filter((pl) => pl !== priceLevelId));
  };

  const isSelected = (priceLevelId) => {
    return selectedPriceLevels.includes(priceLevelId);
  };

  const handleSubmit = async () => {
    // if (selectedPriceLevels.length === 0) {
    //   toast.warning("Please select at least one price level");
    //   return;
    // }

    if (!selectedCompany) {
      toast.warning("Please select a company");
      return;
    }

    const formData = {
      userId,
      selectedItems: selectedPriceLevels,
      selectedCompany: selectedCompany,
    };
    allocateMutation.mutate(formData);
  };

  const clearAllSelections = () => {
    setSelectedPriceLevels([]);
  };

  const getSelectedCompanyName = () => {
    const company = organisations.find((org) => org._id === selectedCompany);
    return company?.name || "Select Company";
  };

  // Show error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 flex flex-col">
        <TitleDiv title="Allocate Price Level" loading={false} />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600">
              {priceLevelsError?.message ||
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

  const getSelectedPriceLevelName = (priceLevelId) => {
    const priceLevel = priceLevelData.find((pl) => pl._id === priceLevelId);
    return priceLevel?.pricelevel || "Unknown Price Level";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <TitleDiv
        title="Allocate Price Level"
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
              Configuring price levels for:{" "}
              <span className="font-semibold">{getSelectedCompanyName()}</span>
            </p>
          )}
        </div>

        {/* User Info Section */}
        {userDetailsData?.data?.userData && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-white/20 p-4 border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Allocating price levels to:{" "}
              {userDetailsData.data.userData.name || "User"}
            </h3>
            <p className="text-sm text-gray-600">
              Current allocated price levels:{" "}
              {userDetailsData.data.userData.pricelevel?.length || 0}
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
              allocate price levels.
            </p>
          </div>
        )}

        {/* Only show price level sections if a company is selected */}
        {selectedCompany && (
          <>
            {/* Selected Price Levels Display */}
            <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-white/20 p-6 transition-all duration-300 border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Selected Price Levels ({selectedPriceLevels.length})
                </h2>
                {selectedPriceLevels.length > 0 && (
                  <button
                    onClick={clearAllSelections}
                    className="mt-2 sm:mt-0 text-sm text-gray-500 hover:text-red-500 transition-colors duration-200 flex items-center gap-1"
                  >
                    <HiX className="text-xs" />
                    Clear All
                  </button>
                )}
              </div>

              {selectedPriceLevels.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {selectedPriceLevels.map((priceLevelId, index) => (
                    <div
                      key={priceLevelId}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-800 rounded-full text-sm font-medium shadow-lg transform hover:scale-105 transition-all duration-200 animate-in slide-in-from-left"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <HiCheck className="text-sm" />
                      <span title={getSelectedPriceLevelName(priceLevelId)}>
                        {truncateText(
                          getSelectedPriceLevelName(priceLevelId),
                          20
                        )}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSelectedPriceLevel(priceLevelId);
                        }}
                        className="ml-1 hover:bg-blue-200 rounded-full p-1 transition-colors duration-200"
                      >
                        <HiX className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <div className="text-center">
                    <HiTag className="text-4xl mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No price levels selected yet</p>
                    <p className="text-xs mt-1">
                      Click on price level cards below to select them
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Price Level Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {!isLoading &&
                priceLevelData.map((priceLevel, index) => (
                  <div
                    key={priceLevel._id}
                    onClick={() => handlePriceLevelSelect(priceLevel)}
                    className={`group relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 transform hover:-translate-y-1 animate-in slide-in-from-bottom ${
                      isSelected(priceLevel._id)
                        ? "border-gray-200"
                        : "border-white/30 hover:border-blue-50"
                    }`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Selection Indicator */}
                    {isSelected(priceLevel._id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-20">
                        <HiCheck className="text-white text-sm" />
                      </div>
                    )}

                    <div className="relative p-4 z-10 flex flex-col ">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`p-2 rounded-xl transition-all duration-300 flex-shrink-0 border ${
                            isSelected(priceLevel._id)
                              ? "bg-blue-100 shadow-lg border-blue-200"
                              : "bg-gray-100 group-hover:bg-blue-100"
                          }`}
                        >
                          <HiTag className="w-7 h-7 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-gray-900 transition-colors duration-300 leading-tight ${
                              isSelected(priceLevel._id) ? "text-blue-900" : ""
                            }`}
                            title={priceLevel.pricelevel}
                          >
                            {truncateText(priceLevel.pricelevel, 18)}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between min-h-[20px] text-xs bg-slate-50 p-2 rounded ">
                        <span className="text-gray-500 font-medium">
                          Status:
                        </span>
                        <span className="text-green-600 font-semibold text-right flex-1 ml-2">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
            </div>

            {/* Action Buttons */}
            {!isLoading && priceLevelData.length > 0 && (
              <div className="w-full mt-12 flex flex-col sm:flex-row justify-start gap-4">
                <button
                  onClick={clearAllSelections}
                  className="sm:w-1/2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  disabled={selectedPriceLevels.length === 0}
                >
                  <HiX className="text-sm" />
                  Clear Selection
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    // selectedPriceLevels.length === 0 ||
                    !selectedCompany ||
                    allocateMutation.isPending
                  }
                  className={`sm:w-1/2 px-8 py-3 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-0.5 ${
                    // selectedPriceLevels.length > 0 &&
                    selectedCompany &&
                    !allocateMutation.isPending
                      ? "bg-pink-500 text-white hover:bg-pink-600 hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  }`}
                >
                  <HiSparkles className="text-sm" />
                  {allocateMutation.isPending
                    ? "Allocating..."
                    : `Allocate to Staff (${selectedPriceLevels.length})`}
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && priceLevelData.length === 0 && selectedCompany && (
              <div className="mt-12 text-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12">
                  <HiTag className="text-6xl mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Price Levels Found
                  </h3>
                  <p className="text-gray-500">
                    There are no price levels available for the selected
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

export default AllocatePriceLevel;
