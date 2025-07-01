import TitleDiv from "@/components/common/TitleDiv";
import useFetch from "@/customHook/useFetch";
import { industries } from "../../../../../constants/industries.js";
import { truncateText } from "../../../../../../backend/utils/textHelpers.js";
import { useEffect, useState } from "react";
import { HiOfficeBuilding, HiCheck, HiX, HiSparkles } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/api/api.js";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const AllocateCompany = () => {
  const [companyData, setCompanyData] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

    const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  //// api call
  const { data, loading } = useFetch("/api/sUsers/getOrganizations");

  useEffect(() => {
    if (data) {
      setCompanyData(data.organizationData);
    }
  }, [data]);

  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.data?.userId;

  useEffect(() => {
    if (!userId) {
      navigate(-1, { replace: true });
    }
  }, [userId, navigate]);

  const handleCompanySelect = (company) => {
    setSelectedCompanies((prev) => {
      const isSelected = prev.find((c) => c === company._id);
      if (isSelected) {
        return prev.filter((c) => c !== company._id);
      } else {
        return [...prev, company?._id];
      }
    });
  };

  const removeSelectedCompany = (companyId) => {
    setSelectedCompanies((prev) => prev.filter((c) => c._id !== companyId));
  };

  const isSelected = (companyId) => {
    return selectedCompanies.some((c) => c === companyId);
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
    console.log(selectedCompanies, userId);

    const formData = {
      userId,
      selectedCompanies,
    };

    try {
      setSubmitLoading(true);
      const res = await api.put(`/api/sUsers/allocateCompany/${cmp_id}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      navigate(-1);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      localStorage.removeItem("tempProductData");
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <TitleDiv title="Allocate Company" loading={loading || submitLoading} />
      <div className="max-w-7xl mx-auto p-6">
        {/* Selected Companies Display - Always Visible */}
        <div className="mb-8 bg-white/80  backdrop-blur-sm rounded-2xl shadow-lg  border-white/20 p-6 transition-all duration-300 border">
          <div className="flex items-center justify-between mb-4 ">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Selected Companies ({selectedCompanies.length})
            </h2>
            {selectedCompanies.length > 0 && (
              <button
                onClick={() => setSelectedCompanies([])}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors duration-200 flex items-center gap-1"
              >
                <HiX className="text-xs" />
                Clear All
              </button>
            )}
          </div>

          {selectedCompanies.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {selectedCompanies.map((company, index) => (
                <div
                  key={company}
                  className="inline-flex items-center gap-2 px-4 py-2  text-gray-500 rounded-full text-sm font-medium shadow-lg transform hover:scale-105 transition-all duration-200 animate-in slide-in-from-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <HiCheck className="text-sm" />
                  <span title={company.name}>
                    {companyData?.find((c) => c._id === company)?.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelectedCompany(company._id);
                    }}
                    className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
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
          {!loading &&
            companyData.map((company, index) => (
              <div
                key={company?._id}
                onClick={() => handleCompanySelect(company)}
                className={`group relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 transform hover:-translate-y-1 animate-in slide-in-from-bottom ${
                  isSelected(company?._id)
                    ? "border-gray-300"
                    : "border-white/30 hover:border-blue-200"
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Selection Indicator */}
                {isSelected(company?._id) && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center z-20">
                    <HiCheck className="text-white text-sm" />
                  </div>
                )}

                {/* Content */}
                <div className="relative p-6 z-10">
                  {/* Company Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`p-1 rounded-xl transition-all duration-300 flex-shrink-0 border ${
                        isSelected(company?._id)
                          ? "bg-blue-100 shadow-lg"
                          : "bg-gray-100 group-hover:bg-blue-100"
                      }`}
                    >
                      {company?.logo ? (
                        <img
                          src={company?.logo}
                          alt={company?.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white">
                          {company?.name?.slice(0, 1).toUpperCase() || "N/A"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-bold text-gray-900 transition-colors duration-300 leading-tight ${
                          isSelected(company?._id) ? "text-blue-900" : ""
                        }`}
                        title={company?.name}
                      >
                        {truncateText(company?.name, 18)}
                      </h3>
                      <p
                        className="text-xs text-gray-500 font-mono mt-1"
                        title={company?.code}
                      >
                        {truncateText(company?.code, 15)}
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
                      {company?.type || "N/A"}
                    </span>
                  </div>

                  {/* Company Details */}
                  <div className="space-y-3 text-sm">
                    {/* Location Row - Always show with consistent spacing */}
                    <div className="flex items-center justify-between min-h-[20px]">
                      <span className="text-gray-500 font-medium">
                        Location:
                      </span>
                      <span
                        className="text-gray-700 font-semibold text-right flex-1 ml-2"
                        title={company?.place}
                      >
                        {company?.place ? truncateText(company.place, 15) : "-"}
                      </span>
                    </div>

                    {/* Industry Row - Always show with consistent spacing */}
                    <div className="flex items-center justify-between min-h-[20px]">
                      <span className="text-gray-500 font-medium">
                        Industry:
                      </span>
                      <span
                        className="text-gray-700 font-semibold text-right flex-1 ml-2"
                        title={getIndustryName(company?.industry)}
                      >
                        {getIndustryName(company?.industry)
                          ? truncateText(getIndustryName(company?.industry), 12)
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

        {/* Action Buttons - Only show when there are companies */}
        {!loading && companyData.length > 0 && (
          <div className="mt-12 flex flex-col sm:flex-row justify-start gap-4">
            <button
              onClick={() => setSelectedCompanies([])}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={selectedCompanies.length === 0}
            >
              <HiX className="text-sm" />
              Clear Selection
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedCompanies.length === 0}
              className={`px-8 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-0.5 ${
                selectedCompanies.length > 0
                  ? "bg-pink-500 text-white hover:bg-pink-600 hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              }`}
            >
              <HiSparkles className="text-sm" />
              Allocate to Staff ({selectedCompanies.length})
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && companyData.length === 0 && (
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
