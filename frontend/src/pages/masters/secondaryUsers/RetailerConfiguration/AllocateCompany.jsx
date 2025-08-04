import TitleDiv from "@/components/common/TitleDiv";
import { industries } from "../../../../../constants/industries.js";
import { truncateText } from "../../../../../../backend/utils/textHelpers.js";
import { useEffect, useState } from "react";
import { HiOfficeBuilding, HiCheck, HiX, HiSparkles } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/api/api.js";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";

const AllocateCompany = () => {
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.data?.userData?._id;

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  // Check if userId exists, redirect if not
  useEffect(() => {
    if (!userId) {
      navigate(-1, { replace: true });
    }
  }, [userId, navigate]);

  // Fetch organizations data
  const {
    data: organizationsData,
    isLoading: organizationsLoading,
    error: organizationsError,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await api.get("/api/sUsers/getOrganizations", {
        withCredentials: true,
      });
      return response.data;
    },
    enabled: !!userId, // Only fetch if userId exists
  });

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
          // params: { minimal: true },
          withCredentials: true,
        }
      );
      return response.data;
    },
    enabled: !!userId, // Only fetch if userId exists
  });

  // Allocate companies mutation
  const allocateMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.put(
        `/api/sUsers/allocateCompany/${cmp_id}`,
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
      localStorage.removeItem("tempProductData");
    },
  });

  // Set pre-selected companies when user details are loaded
  useEffect(() => {
    const userOrganizations = userDetailsData?.data?.organization || [];
    if (userOrganizations) {

      const selectedOrganizations= userOrganizations.map((org) => org._id);
      setSelectedCompanies(selectedOrganizations);

      // setSelectedCompanies(userOrganizations);
    }
  }, [userDetailsData]);

  const companyData = organizationsData?.organizationData || [];
  const isLoading = organizationsLoading || userDetailsLoading;
  const hasError = organizationsError || userDetailsError;

  const handleCompanySelect = (company) => {
    setSelectedCompanies((prev) => {
      const isSelected = prev.includes(company._id);
      if (isSelected) {
        return prev.filter((c) => c !== company._id);
      } else {
        return [...prev, company._id];
      }
    });
  };

  const removeSelectedCompany = (companyId) => {
    setSelectedCompanies((prev) => prev.filter((c) => c !== companyId));
  };

  const isSelected = (companyId) => {
    return selectedCompanies.includes(companyId);
  };

  const getCompanyTypeColor = (type) => {
    const colors = {
      self: "bg-blue-100 text-blue-800",
      integrated: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getIndustryName = (industryCode) => {
    const industry = industries?.find(
      (industry) => industry?.code === industryCode
    );
    return industry?.industry || "";
  };

  const handleSubmit = async () => {
    if (selectedCompanies.length === 0) {
      toast.warning("Please select at least one company");
      return;
    }

    const formData = {
      userId,
      selectedCompanies,
    };

    allocateMutation.mutate(formData);
  };

  const clearAllSelections = () => {
    setSelectedCompanies([]);
  };

  // Show error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <TitleDiv title="Allocate Company" loading={false} />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600">
              {organizationsError?.message ||
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

  const getSelectedCompanyName = (companyId) => {
    const company = companyData.find((c) => c._id === companyId);
    return company?.name || "Unknown Company";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <TitleDiv
        title="Allocate Company"
        loading={isLoading || allocateMutation.isPending}
      />
      <div className="max-w-7xl mx-auto p-6">
        {/* User Info Section */}
        {userDetailsData?.data?.userData && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-white/20 p-4 border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Allocating companies to:{" "}
              {userDetailsData.data.userData.name || "User"}
            </h3>
            <p className="text-sm text-gray-600">
              Current allocated companies:{" "}
              {userDetailsData.data.userData.organization?.length || 0}
            </p>
          </div>
        )}

        {/* Selected Companies Display */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-white/20 p-6 transition-all duration-300 border">
          <div className="flex flex-col sm:flex-row  sm:items-center sm:justify-between mb-4">
            <h2 className="sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse "></div>
              Selected Companies ({selectedCompanies.length})
            </h2>
            {selectedCompanies.length > 0 && (
              <button
                onClick={clearAllSelections}
                className=" mt-2 sm:mt-0  text-sm text-gray-500 hover:text-red-500 transition-colors duration-200 flex items-center gap-1"
              >
                <HiX className="text-xs" />
                Clear All
              </button>
            )}
          </div>

          {selectedCompanies.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {selectedCompanies.map((companyId, index) => (
                <div
                  key={companyId}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-800 rounded-full text-sm font-medium shadow-lg transform hover:scale-105 transition-all duration-200 animate-in slide-in-from-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <HiCheck className="text-sm" />
                  <span  title={getSelectedCompanyName(companyId)}>
                    {truncateText(getSelectedCompanyName(companyId), 20)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelectedCompany(companyId);
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
                <HiOfficeBuilding className="text-4xl mx-auto mb-2 opacity-50" />
                <p className="text-sm">No companies selected yet</p>
                <p className="text-xs mt-1">
                  Click on company cards below to select them
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {!isLoading &&
            companyData.map((company, index) => (
              <div
                key={company._id}
                onClick={() => handleCompanySelect(company)}
                className={`group relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 transform hover:-translate-y-1 animate-in slide-in-from-bottom ${
                  isSelected(company._id)
                    ? "border-gray-200 "
                    : "border-white/30 hover:border-blue-50"
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Selection Indicator */}
                {isSelected(company._id) && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-20">
                    <HiCheck className="text-white text-sm" />
                  </div>
                )}

                {/* Content */}
                <div className="relative p-6 z-10">
                  {/* Company Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`p-1 rounded-xl transition-all duration-300 flex-shrink-0 border ${
                        isSelected(company._id)
                          ? "bg-blue-100 shadow-lg border-blue-200"
                          : "bg-gray-100 group-hover:bg-blue-100"
                      }`}
                    >
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
                          {company.name?.slice(0, 1).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-bold text-gray-900 transition-colors duration-300 leading-tight ${
                          isSelected(company._id) ? "text-blue-900" : ""
                        }`}
                        title={company.name}
                      >
                        {truncateText(company.name, 18)}
                      </h3>
                      <p
                        className="text-xs text-gray-500 font-mono mt-1"
                        title={company.code}
                      >
                        {truncateText(company.code, 15)}
                      </p>
                    </div>
                  </div>

                  {/* Company Type Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCompanyTypeColor(
                        company.type
                      )}`}
                    >
                      {company.type || "N/A"}
                    </span>
                  </div>

                  {/* Company Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between min-h-[20px]">
                      <span className="text-gray-500 font-medium">
                        Location:
                      </span>
                      <span
                        className="text-gray-700 font-semibold text-right flex-1 ml-2"
                        title={company.place}
                      >
                        {company.place ? truncateText(company.place, 15) : "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between min-h-[20px]">
                      <span className="text-gray-500 font-medium">
                        Industry:
                      </span>
                      <span
                        className="text-gray-700 font-semibold text-right flex-1 ml-2"
                        title={getIndustryName(company.industry)}
                      >
                        {getIndustryName(company.industry)
                          ? truncateText(getIndustryName(company.industry), 12)
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
        </div>

        {/* Action Buttons */}
        {!isLoading && companyData.length > 0 && (
          <div className="w-full mt-12 flex flex-col sm:flex-row justify-start gap-4">
            <button
              onClick={clearAllSelections}
              className="sm:w-1/2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={selectedCompanies.length === 0}
            >
              <HiX className="text-sm" />
              Clear Selection
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                selectedCompanies.length === 0 || allocateMutation.isPending
              }
              className={` sm:w-1/2 px-8 py-3 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-0.5 ${
                selectedCompanies.length > 0 && !allocateMutation.isPending
                  ? "bg-pink-500 text-white hover:bg-pink-600 hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              }`}
            >
              <HiSparkles className="text-sm" />
              {allocateMutation.isPending
                ? "Allocating..."
                : `Allocate to Staff (${selectedCompanies.length})`}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && companyData.length === 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12">
              <HiOfficeBuilding className="text-6xl mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Companies Found
              </h3>
              <p className="text-gray-500">
                There are no companies available to allocate at this time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocateCompany;
