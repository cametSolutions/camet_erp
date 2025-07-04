import TitleDiv from "@/components/common/TitleDiv";
// import { truncateText } from "../../../../../../backend/utils/textHelpers.js";
import { useEffect, useState } from "react";
import {
  //   HiCheck,
  HiX,
  HiSparkles,
  HiCollection,
  HiOfficeBuilding,
  HiSearch,
  HiCheckCircle,
  HiOutlineCheckCircle,
  //   HiFilter,
  HiChevronUp,
  HiChevronDown,
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

const AllocateSubGroup = () => {
  const [selectedSubGroups, setSelectedSubGroups] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByAccountGroup, setFilterByAccountGroup] = useState("");
  const [sortBy, setSortBy] = useState("subGroup"); // subGroup, accountGroup
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
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
    enabled: !!userId,
  });

  // Set default selected company when user details are loaded
  useEffect(() => {
    if (userDetailsData?.data?.userData?.organisation?.length > 0) {
      if (!selectedCompany) {
        setSelectedCompany(userDetailsData.data.userData.organisation[0]._id);
      }
    }
  }, [userDetailsData, selectedCompany]);

  // Fetch sub groups data based on selected company
  const {
    data: subGroupsData,
    isLoading: subGroupsLoading,
    error: subGroupsError,
  } = useQuery({
    queryKey: ["subGroups", selectedCompany],
    queryFn: async () => {
      const response = await api.get(
        `/api/sUsers/getSubGroup/${selectedCompany}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    enabled: !!userId && !!selectedCompany,
  });

  // Allocate sub groups mutation
  const allocateMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.put(
        `/api/sUsers/allocateSubDetails/${selectedCompany}?subDetail=selectedSubGroups`,
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
  });

  // Set pre-selected sub groups when user details are loaded
  useEffect(() => {
    if (userDetailsData) {
      const configuration = userDetailsData?.data?.configurations?.find(
        (item) => item?.organization?.toString() === selectedCompany
      );

      const previouslySelectedSubGroups =
        configuration?.selectedSubGroups || [];

      setSelectedSubGroups(previouslySelectedSubGroups);
    }
  }, [userDetailsData, selectedCompany]);

  // Reset selected sub groups when company changes
  useEffect(() => {
    // setSelectedSubGroups([]);
    setCurrentPage(1);
    setSearchTerm("");
    setFilterByAccountGroup("");
  }, [selectedCompany]);

  const subGroupData = subGroupsData?.data || [];
  const isLoading = subGroupsLoading || userDetailsLoading;
  const hasError = subGroupsError || userDetailsError;
  const organisations = userDetailsData?.data?.organization || [];

  // Get unique account groups for filter
  //   const accountGroups = [...new Set(subGroupData.map(item => item.accountGroup?.accountGroup).filter(Boolean))];

  // Filter and sort data
  const filteredAndSortedData = subGroupData
    .filter((item) => {
      const matchesSearch =
        item.subGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subGroup_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        !filterByAccountGroup ||
        item.accountGroup?.accountGroup === filterByAccountGroup;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "accountGroup") {
        aValue = a.accountGroup?.accountGroup || "";
        bValue = b.accountGroup?.accountGroup || "";
      } else {
        aValue = a[sortBy] || "";
        bValue = b[sortBy] || "";
      }

      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSubGroupSelect = (subGroup) => {
    setSelectedSubGroups((prev) => {
      const isSelected = prev.includes(subGroup._id);
      if (isSelected) {
        return prev.filter((sg) => sg !== subGroup._id);
      } else {
        return [...prev, subGroup._id];
      }
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredAndSortedData.map((item) => item._id);
    setSelectedSubGroups(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedSubGroups([]);
  };

  const isSelected = (subGroupId) => {
    return selectedSubGroups.includes(subGroupId);
  };

  const handleSubmit = async () => {
    if (selectedSubGroups.length === 0) {
      toast.warning("Please select at least one sub group");
      return;
    }

    if (!selectedCompany) {
      toast.warning("Please select a company");
      return;
    }

    const formData = {
      userId,
      selectedItems: selectedSubGroups,
      selectedCompany: selectedCompany,
    };

    allocateMutation.mutate(formData);
  };

  const getSelectedCompanyName = () => {
    const company = organisations.find((org) => org._id === selectedCompany);
    return company?.name || "Select Company";
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Show error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 flex flex-col">
        <TitleDiv title="Allocate Sub Groups" loading={false} />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600">
              {subGroupsError?.message ||
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <TitleDiv
        title="Allocate Sub Groups"
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
              Configuring sub groups for:{" "}
              <span className="font-semibold">{getSelectedCompanyName()}</span>
            </p>
          )}
        </div>

        {/* User Info Section */}
        {userDetailsData?.data?.userData && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-white/20 p-4 border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Allocating sub groups to:{" "}
              {userDetailsData.data.userData.name || "User"}
            </h3>
            <p className="text-sm text-gray-600">
              Current allocated sub groups: {selectedSubGroups.length}
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
              allocate sub groups.
            </p>
          </div>
        )}

        {/* Only show sub group sections if a company is selected */}
        {selectedCompany && (
          <>
            {/* Selection Summary */}
            <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-white/20 p-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiCollection className="text-blue-600" />
                  <span className="font-semibold text-gray-800">
                    Selected: {selectedSubGroups.length} /{" "}
                    {filteredAndSortedData.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border-white/20 p-4 border">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sub groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter by Account Group */}
                {/* <div className="md:w-64">
                  <Select value={filterByAccountGroup} onValueChange={setFilterByAccountGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Account Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Account Groups</SelectItem>
                      {accountGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
              </div>
            </div>

            {/* Sub Groups Table */}
            {!isLoading && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border-white/20 border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={
                              selectedSubGroups.length ===
                                filteredAndSortedData.length &&
                              filteredAndSortedData.length > 0
                            }
                            onChange={
                              selectedSubGroups.length ===
                              filteredAndSortedData.length
                                ? handleDeselectAll
                                : handleSelectAll
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th
                          className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("subGroup")}
                        >
                          <div className="flex items-center gap-2">
                            Sub Group
                            {sortBy === "subGroup" &&
                              (sortOrder === "asc" ? (
                                <HiChevronUp className="text-sm" />
                              ) : (
                                <HiChevronDown className="text-sm" />
                              ))}
                          </div>
                        </th>
                        {/* <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Sub Group ID
                        </th> */}
                        <th
                          className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("accountGroup")}
                        >
                          <div className="flex items-center gap-2">
                            Account Group
                            {sortBy === "accountGroup" &&
                              (sortOrder === "asc" ? (
                                <HiChevronUp className="text-sm" />
                              ) : (
                                <HiChevronDown className="text-sm" />
                              ))}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedData.map((subGroup) => (
                        <tr
                          key={subGroup._id}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            isSelected(subGroup._id) ? "bg-blue-50" : ""
                          }`}
                          onClick={() => handleSubGroupSelect(subGroup)}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected(subGroup._id)}
                              onChange={() => handleSubGroupSelect(subGroup)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isSelected(subGroup._id) ? (
                                <HiCheckCircle className="text-blue-500 text-sm" />
                              ) : (
                                <HiOutlineCheckCircle className="text-gray-300 text-sm" />
                              )}
                              <span className="font-medium text-gray-900">
                                {subGroup.subGroup}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {subGroup.accountGroup?.accountGroup || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredAndSortedData.length
                      )}{" "}
                      of {filteredAndSortedData.length} results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
                        {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {!isLoading && subGroupData.length > 0 && (
              <div className="w-full mt-8 flex flex-col sm:flex-row justify-start gap-4">
                <button
                  onClick={handleDeselectAll}
                  className="sm:w-1/2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  disabled={selectedSubGroups.length === 0}
                >
                  <HiX className="text-sm" />
                  Clear Selection
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    selectedSubGroups.length === 0 ||
                    !selectedCompany ||
                    allocateMutation.isPending
                  }
                  className={`sm:w-1/2 px-8 py-3 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-0.5 ${
                    selectedSubGroups.length > 0 &&
                    selectedCompany &&
                    !allocateMutation.isPending
                      ? "bg-pink-500 text-white hover:bg-pink-600 hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  }`}
                >
                  <HiSparkles className="text-sm" />
                  {allocateMutation.isPending
                    ? "Allocating..."
                    : `Allocate to Staff (${selectedSubGroups.length})`}
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && subGroupData.length === 0 && selectedCompany && (
              <div className="mt-12 text-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12">
                  <HiCollection className="text-6xl mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Sub Groups Found
                  </h3>
                  <p className="text-gray-500">
                    There are no sub groups available for the selected company.
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

export default AllocateSubGroup;
