import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/api";
import { toast } from "sonner";
import TitleDiv from "@/components/common/TitleDiv";

const permissionSections = [

{
    title: "Main Menu",
    items: [
     
      { key: "hotelManagement", label: "Hotel Management" },
      { key: "restaurantManagement", label: "Restaurant Management" },
      { key: "voucher", label: "Voucher" },
       { key: "Reports", label: "Reports" },
    ],
  },
{
    title: "Hotel",
    items: [
      { key: "hotelDashboard", label: "Hotel Dashboard" },
      { key: "bookingList", label: "Booking List" },
      { key: "checkinList", label: "Check-in List" },
      { key: "checkoutList", label: "Checkout List" },
      { key: "editTariffRate", label: "Edit Tariff Rate" },
      { key: "swapRoom", label: "Swap Room" },
      { key: "roomShift", label: "Room Shift" },
      { key: "guestLedger", label: "Guest Ledger" },
    ],
  },
  {
    title: "Restaurant",
    items: [
      { key: "restaurantDashboard", label: "Restaurant Dashboard" },
      { key: "kotPage", label: "KOT Page" },
      { key: "restaurantPayment", label: "Restaurant Payment" },
    
       { key: "restaurantDailySales", label: "Daily Sales" },
    { key: "categoryWiseSales", label: "Category Wise Sales" },
    { key: "itemWiseSales", label: "Item Wise Sales" },
    { key: "kotRegister", label: "KOT Register" },
    { key: "receiptReport", label: "Receipt Report" },
    { key: "saleRegister", label: "Sale Register" },
    ],
  },
  {
    title: "Reports",
    items: [
      { key: "hotelReports", label: "Hotel Reports" },
      { key: "restaurantReports", label: "Restaurant Reports" },
      { key: "voucherReports", label: "Voucher Reports" },
    
        { key: "dailySalesReport", label: "Daily Sales" },
    { key: "foDailyStatement", label: "FO Daily Statement" },
    { key: "flashReport", label: "Flash Report" },
    { key: "paxReport", label: "Pax Report" },
    { key: "foodPlanReport", label: "Food Plan Report" },
    { key: "occupancyReport", label: "Occupancy Report" },
    { key: "roomSummaryReport", label: "Room Summary Report" },
    { key: "receiptReport", label: "Receipt Report" },
    { key: "travelAgentReport", label: "Travel Agent Report" },
    { key: "foBillSummary", label: "FO Bill Summary" },
    { key: "cancellationReport", label: "Cancellation Report" },

    ],
  },
  // {
  //   title: "Admin Settings",
  //   items: [
  //     { key: "userCreation", label: "User Creation" },
  //     { key: "menuRights", label: "Menu Rights" },
  //     { key: "companySettings", label: "Company Settings" },
  //     { key: "branchSettings", label: "Branch Settings" },
  //   ],
  // },
];

const allKeys = permissionSections.flatMap((section) =>
  section.items.map((item) => item.key)
);

const buildDefaultPermissions = () =>
  allKeys.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {});

function UserWiseMenuRightsSettings() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [permissions, setPermissions] = useState(buildDefaultPermissions());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/sUsers/fetchSecondaryUsers", {
          withCredentials: true,
        });

        const fetchedUsers = res?.data?.secondaryUsers || [];
        setUsers(fetchedUsers);
      } catch (error) {
        console.log(error);
        toast.error(
          error?.response?.data?.message || "Failed to fetch users"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!selectedUser) {
        setPermissions(buildDefaultPermissions());
        setSelectedUserData(null);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(
          `/api/sUsers/getUserPermissions/${selectedUser}`,
          {
            withCredentials: true,
          }
        );

        const user = res?.data?.user;
        const savedPermissions = user?.permissions || {};

        setSelectedUserData(user);
        setPermissions({
          ...buildDefaultPermissions(),
          ...savedPermissions,
        });
      } catch (error) {
        console.log(error);
        toast.error(
          error?.response?.data?.message || "Failed to fetch permissions"
        );
        setPermissions(buildDefaultPermissions());
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [selectedUser]);

  const allowedCount = useMemo(
    () => Object.values(permissions).filter(Boolean).length,
    [permissions]
  );

  const handleToggle = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSectionToggle = (items, checked) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      items.forEach((item) => {
        updated[item.key] = checked;
      });
      return updated;
    });
  };

  const handleTickAll = () => {
    const updated = {};
    allKeys.forEach((key) => {
      updated[key] = true;
    });
    setPermissions(updated);
  };

  const handleUntickAll = () => {
    setPermissions(buildDefaultPermissions());
  };

  const handleSave = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    setSaving(true);
    try {
      await api.put(
        `/api/sUsers/updateUserPermissions/${selectedUser}`,
        { permissions },
        { withCredentials: true }
      );

      toast.success("Permissions updated successfully");
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to save permissions"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex-1 text-gray-600">
      <div className="flex flex-col sticky top-0 z-50 bg-slate-100">
        <TitleDiv
          loading={loading || saving}
          title="Menu Rights Settings"
          from="/sUsers/dashboard"
        />
      </div>

      <div className="p-3 md:p-4">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-800">
                  User Permission Settings
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Select a user and tick the allowed menus.
                </p>
              </div>

              <div className="w-full md:w-80">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Allowed {allowedCount} / {allKeys.length}
                </span>

                {selectedUserData?.name && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {selectedUserData.name}
                  </span>
                )}

                {selectedUserData?.email && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {selectedUserData.email}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleTickAll}
                  type="button"
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  Tick All
                </button>

                <button
                  onClick={handleUntickAll}
                  type="button"
                  className="rounded-md bg-rose-600 px-3 py-2 text-xs font-medium text-white hover:bg-rose-700"
                >
                  Untick All
                </button>

                <button
                  onClick={handleSave}
                  type="button"
                  disabled={saving}
                  className="rounded-md bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Permissions"}
                </button>
              </div>
            </div>
          </div>

          {permissionSections.map((section) => {
            const sectionChecked = section.items.every(
              (item) => permissions[item.key]
            );

            return (
              <div
                key={section.title}
                className="rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                    {section.title}
                  </h2>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={sectionChecked}
                      onChange={(e) =>
                        handleSectionToggle(section.items, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    Tick All
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
                  {section.items.map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                        permissions[item.key]
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={permissions[item.key]}
                        onChange={() => handleToggle(item.key)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <span className="font-medium text-slate-700">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default UserWiseMenuRightsSettings;