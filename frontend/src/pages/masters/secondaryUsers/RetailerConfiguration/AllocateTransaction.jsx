import TitleDiv from "@/components/common/TitleDiv";
import { useEffect, useState } from "react";
import { HiSparkles } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/api/api.js";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";

const AllocateTransaction = () => {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [access, setAccess] = useState({ own: false, all: false });

  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.data?.userData?._id;

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  // redirect back if no user
  useEffect(() => {
    if (!userId) navigate(-1, { replace: true });
  }, [userId, navigate]);

  // organizations
  const {
    data: organizationsData,
    isLoading: organizationsLoading,
    error: organizationsError,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await api.get("/api/sUsers/getOrganizations", {
        withCredentials: true,
      });
      return res.data;
    },
    enabled: !!userId,
  });

  // user details (to prefill access if you want)
  const {
    data: userDetailsData,
    isLoading: userDetailsLoading,
    error: userDetailsError,
  } = useQuery({
    queryKey: ["secUserDetails", userId],
    queryFn: async () => {
      const res = await api.get(`/api/sUsers/getSecUserDetails/${userId}`, {
        withCredentials: true,
      });
      return res.data;
    },
    enabled: !!userId,
  });

  // when userDetails load, you can pre-select first org + its access
  useEffect(() => {
    const orgs = userDetailsData?.data?.organization || [];
    const configs = userDetailsData?.data?.configurations || [];

    if (orgs.length && !selectedCompany) {
      const firstOrgId = orgs[0]._id || orgs[0];
      setSelectedCompany(firstOrgId);

      const cfg = configs.find(
        (c) => c.organization?.toString() === firstOrgId.toString()
      );
      if (cfg) {
        setAccess({
          own: cfg.ownTransactions ?? false,
          all: cfg.allTransactions ?? false,
        });
      }
    }
  }, [userDetailsData, selectedCompany]);

  const companyData = organizationsData?.organizationData || [];
  const isLoading = organizationsLoading || userDetailsLoading;
  const hasError = organizationsError || userDetailsError;

  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.put(
        `/api/sUsers/updateTransactionAccess/${cmp_id}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      navigate(-1);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "An error occurred");
      console.error(err);
    },
  });

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompany(companyId);

    // load existing access for this company (if any)
    const configs = userDetailsData?.data?.configurations || [];
    const cfg = configs.find(
      (c) => c.organization?.toString() === companyId.toString()
    );
    if (cfg) {
      setAccess({
        own: cfg.ownTransactions ?? false,
        all: cfg.allTransactions ?? false,
      });
    } else {
      setAccess({ own: false, all: false });
    }
  };

  const handleCheckboxChange = (key) => {
    setAccess((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    if (!selectedCompany) {
      toast.warning("Please select a company");
      return;
    }

    if (!access.own && !access.all) {
      toast.warning("Please select at least one option (Own / All)");
      return;
    }

    const formData = {
      userId,
      companyId: selectedCompany,
      access, // { own: boolean, all: boolean }
    };

    updateMutation.mutate(formData);
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <TitleDiv title="Transaction Access" loading={false} />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <TitleDiv
        title="Transaction Access"
        loading={isLoading || updateMutation.isPending}
      />
      <div className="max-w-2xl mx-auto p-6">
        {/* User info */}
        {userDetailsData?.data?.userData && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-white/20 p-4 border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Set transaction access for{" "}
              {userDetailsData.data.userData.name || "User"}
            </h3>
          </div>
        )}

        {/* Company dropdown */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-white/20 p-6 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company
          </label>
          <select
            value={selectedCompany}
            onChange={handleCompanyChange}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
          >
            <option value="">Select a company</option>
            {companyData.map((cmp) => (
              <option key={cmp._id} value={cmp._id}>
                {cmp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-white/20 p-6 border">
          <p className="text-sm font-semibold text-gray-800 mb-3">
            Transaction visibility
          </p>
          <div className="flex flex-col gap-3">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={access.own}
                onChange={() => handleCheckboxChange("own")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span>Own transactions</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={access.all}
                onChange={() => handleCheckboxChange("all")}
                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span>All transactions</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col sm:flex-row justify-start gap-4">
          <button
            onClick={() => {
              setSelectedCompany("");
              setAccess({ own: false, all: false });
            }}
            className="sm:w-1/2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            disabled={!selectedCompany && !access.own && !access.all}
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !selectedCompany || updateMutation.isPending
            }
            className={`sm:w-1/2 px-8 py-3 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-0.5 ${
              selectedCompany && !updateMutation.isPending
                ? "bg-pink-500 text-white hover:bg-pink-600 hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
            }`}
          >
            <HiSparkles className="text-sm" />
            {updateMutation.isPending ? "Saving..." : "Save Access"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllocateTransaction;
