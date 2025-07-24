import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../api/api";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom"; // Add this import
import SecUserPopup from "../../components/admin/SecUserPopup";
import { RingLoader } from "react-spinners";
import { 
  FiMail, 
  FiPhone, 
  FiUsers, 
  FiCalendar,
  FiSearch,
} from "react-icons/fi";

// Shadcn UI imports
import { Card, CardContent, CardHeader, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Crown, Star, TrendingUp, Building2 } from "lucide-react";
import { FaUserShield } from "react-icons/fa";
import { RiBuilding3Fill } from "react-icons/ri";



function PrimaryUsers() {
  const [search, setSearch] = useState("");
  const [showSecUsers, setShowSecUsers] = useState(false);
  const [filteredSecUsers, setFilteredSecUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(12);
  const [option, setOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate(); 
  // Fetch primary users data using TanStack Query
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['primaryUsers'],
    queryFn: async () => {
      const res = await api.get("/api/admin/getPrimaryUsers", {
        withCredentials: true,
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const data = usersData?.priUsers || [];
  const org = usersData?.org || [];
  const secUsers = usersData?.secUsers || [];

  // Trigger animations after component mounts
  useEffect(() => {
    if (!isLoading && usersData) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, usersData]);
  const handleUserCardClick = (userId) => {
    console.log("User ID:", userId);
    navigate(`/admin/profile/${userId}`);
  };

  // Calculate stats for the overview section
  const getOverviewStats = () => {
    const primaryUsersActive = data.filter(user => !user.isBlocked).length;
    const primaryUsersInactive = data.filter(user => user.isBlocked).length;
    
    const secondaryUsersActive = secUsers.filter(user => user.isActive).length;
    const secondaryUsersInactive = secUsers.filter(user => !user.isActive).length;
    
    const companiesActive = org.filter(company => company.isActive).length;
    const companiesInactive = org.filter(company => !company.isActive).length;
    
    return {
      primaryUsers: {
        total: data.length,
        active: primaryUsersActive,
        inactive: primaryUsersInactive
      },
      secondaryUsers: {
        total: secUsers.length,
        active: secondaryUsersActive,
        inactive: secondaryUsersInactive
      },
      companies: {
        total: org.length,
        active: companiesActive,
        inactive: companiesInactive
      }
    };
  };

  const filteredData = data?.filter((item) => {
    const isBlocked = item.isBlocked;
    return (
      (item.userName.toLowerCase()?.includes(search?.toLowerCase()) ||
        item.email.toLowerCase()?.includes(search?.toLowerCase())) &&
      (option === "" ||
        (option === "blocked" && isBlocked) ||
        (option === "unblocked" && !isBlocked))
    );
  });

  const calculateExpiresAt = (createdAt, period) => {
    let expirationDate = dayjs(createdAt);
    if (period === "monthly") {
      expirationDate = expirationDate?.add(30, "days");
    } else if (period === "yearly") {
      expirationDate = expirationDate?.add(1, "year");
    }
    return expirationDate?.format("DD/MM/YYYY");
  };

  const disablePageScroll = () => {
    document.body.style.overflowY = "hidden";
  };

  const enablePageScroll = () => {
    document.body.style.overflow = "";
  };

  useEffect(() => {
    if (showSecUsers) {
      disablePageScroll();
    } else {
      enablePageScroll();
    }
  }, [showSecUsers]);

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentUsers = filteredData.slice(firstPostIndex, lastPostIndex);

  const getInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').toUpperCase() || 'U';
  };

  const getOrganizationStats = (userId) => {
    const userOrgs = org.filter((orgItem) => orgItem?.owner === userId);
    const activeOrgs = userOrgs.filter(orgItem => orgItem?.isActive);
    const inactiveOrgs = userOrgs.filter(orgItem => !orgItem?.isActive);
    
    return {
      total: userOrgs.length,
      active: activeOrgs.length,
      inactive: inactiveOrgs.length
    };
  };

  const getSecondaryUserStats = (userId) => {
    const userSecUsers = secUsers.filter((secUser) => secUser?.primaryUser === userId);
    const activeSecUsers = userSecUsers.filter(secUser => secUser?.isActive);
    const inactiveSecUsers = userSecUsers.filter(secUser => !secUser?.isActive);
    
    return {
      total: userSecUsers.length,
      active: activeSecUsers.length,
      inactive: inactiveSecUsers.length
    };
  };

  const getStatusColor = (user) => {
    if (user.isBlocked) return "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200";
    if (user.subscription === "yearly") return "bg-gradient-to-br from-blue-50 to-gray-50 border-blue-200";
    return "bg-gradient-to-br from-violet-50 to-gray-50 border-violet-200";
  };

  const getPlanIcon = (subscription) => {
    if (subscription === "yearly") return <Crown className="h-4 w-4 text-yellow-500" />;
    return <Star className="h-4 w-4 text-gray-400" />;
  };

  const overviewStats = getOverviewStats();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Stats Section Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-20 mt-1" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 animate-pulse" />
            <Skeleton className="h-4 w-24 mt-2 animate-pulse" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64 animate-pulse" />
            <Skeleton className="h-10 w-32 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="h-80 animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32 mt-1" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Card className="w-full max-w-md transform transition-all duration-500 hover:scale-105">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-semibold mb-2">Error loading users</h3>
            <p className="text-gray-600 mb-4">There was an error loading the primary users data.</p>
            <Button 
              onClick={() => queryClient.invalidateQueries(['primaryUsers'])}
              className="transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-0 w-full h-full z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="animate-spin">
            <RingLoader color="#1c14a0" />
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Stats Overview Section */}
     <div
  className={`transition-all duration-700 ${
    isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
  }`}
>
<div
  className={`transition-all duration-700 ${
    isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
  }`}
>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    {/* Primary Users */}
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-md">
            <FiUsers className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Primary Users
            </h3>
            <p className="text-xl font-bold text-blue-700">
              {overviewStats.primaryUsers.total}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-between text-sm text-gray-600">
        <div className="text-center">
          <p className="text-gray-500">Active</p>
          <p className="text-green-600 font-semibold">
            {overviewStats.primaryUsers.active}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Inactive</p>
          <p className="text-red-600 font-semibold">
            {overviewStats.primaryUsers.inactive}
          </p>
        </div>
      </CardContent>
    </Card>

    {/* Secondary Users */}
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-md">
            <FaUserShield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Secondary Users
            </h3>
            <p className="text-xl font-bold text-green-700">
              {overviewStats.secondaryUsers.total}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-between text-sm text-gray-600">
        <div className="text-center">
          <p className="text-gray-500">Active</p>
          <p className="text-green-600 font-semibold">
            {overviewStats.secondaryUsers.active}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Inactive</p>
          <p className="text-red-600 font-semibold">
            {overviewStats.secondaryUsers.inactive}
          </p>
        </div>
      </CardContent>
    </Card>

    {/* Companies */}
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-md">
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Companies</h3>
            <p className="text-xl font-bold text-purple-700">
              {overviewStats.companies.total}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-between text-sm text-gray-600">
        <div className="text-center">
          <p className="text-gray-500">Active</p>
          <p className="text-green-600 font-semibold">
            {overviewStats.companies.active}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Inactive</p>
          <p className="text-red-600 font-semibold">
            {overviewStats.companies.inactive}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

</div>


        {/* Header */}
        <div className={`flex items-center justify-between transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Primary Users
            </h2>
            <p className="text-gray-600 transform transition-all duration-500 hover:text-gray-800">
              Manage your primary users and their organizations
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors duration-200 group-focus-within:text-blue-500" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300"
              />
            </div>
          </div>
        </div>

        {/* User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {currentUsers.map((user, index) => {
            const orgStats = getOrganizationStats(user._id);
            const secUserStats = getSecondaryUserStats(user._id);
            const isHovered = hoveredCard === user._id;
            
            return (
              <Card 
                key={user._id} 
                className={`${getStatusColor(user)} border rounded-xl relative overflow-hidden transition-all duration-500 shadow-lg hover:shadow-2xl hover:-translate-y-2 cursor-pointer group transform ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                onMouseEnter={() => setHoveredCard(user._id)}
                onMouseLeave={() => setHoveredCard(null)}
                 onClick={() => handleUserCardClick(user._id)} // Add click handler
                style={{
                  animationDelay: `${index * 0.1}s`,
                  transitionDelay: `${index * 0.05}s`
                }}
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/20 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                
                {/* Animated Status Indicator */}
                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full transition-all duration-300 ${
                  user.isBlocked 
                    ? 'bg-red-400 shadow-red-400/50' 
                    : 'bg-green-400 shadow-green-400/50'
                } ${isHovered ? 'animate-pulse scale-125 shadow-lg' : 'shadow-md'}`} />
                
                {/* Premium Badge with Animation */}
                {user.subscription === "yearly" && (
                  <div className="z-50 absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 z-10 transform transition-all duration-300 hover:scale-105 ">
                    <Crown className="h-3 w-3 " />
                  </div>
                )}

                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className={`h-14 w-14 transition-all duration-500 ${
                        isHovered ? 'scale-110 shadow-xl' : 'shadow-md'
                      }`}>
                        <AvatarImage 
                          src="https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg" 
                          alt={user.userName}
                          className="transition-all duration-300 hover:scale-110"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold transition-all duration-300 group-hover:from-blue-600 group-hover:to-purple-700">
                          {getInitials(user.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg transform transition-all duration-300 hover:scale-110">
                        <div className={`transition-all duration-300 ${isHovered ? 'rotate-12' : ''}`}>
                          {getPlanIcon(user.subscription)}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate text-lg transition-all duration-300 ">
                        {user.userName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={user.isBlocked ? "destructive" : "default"}
                          className="text-xs font-medium transition-all duration-300 hover:scale-105"
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </Badge>
                        <Badge 
                          className={`text-xs font-medium transition-all duration-300 hover:scale-105 ${
                            user.subscription === "yearly" 
                              ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300" 
                              : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300"
                          }`}
                        >
                          {user.subscription === "yearly" ? "Yearly" : "Monthly"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 relative z-10">
                  {/* Contact Info with Hover Effects */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 transition-all duration-300 hover:text-blue-600 hover:translate-x-1">
                      <FiMail className="h-4 w-4 text-blue-500 transition-all duration-300 hover:scale-110" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 transition-all duration-300 hover:text-green-600 hover:translate-x-1">
                      <FiPhone className="h-4 w-4 text-green-500 transition-all duration-300 hover:scale-110" />
                      <span>{user.mobile}</span>
                    </div>
                  </div>

                  {/* Animated Dates Section */}
                  <div className="text-xs text-gray-500 space-y-1 bg-gray-50 py-2 px-3 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-gray-100 hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="h-3 w-3 text-blue-500 transition-all duration-300 hover:rotate-12" />
                      <span className="transition-all duration-300 hover:text-blue-600">
                        Created: {dayjs(user.createdAt).format("DD/MM/YYYY")}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FiCalendar className="h-3 w-3 text-gray-700 transition-all duration-300 hover:rotate-12" />
                      <span className="text-gray-600 font-medium transition-all duration-300 hover:text-gray-800">
                        Expires: {calculateExpiresAt(user.createdAt, user.subscription)}
                      </span>
                    </div>
                  </div>

                  {/* Stats Section with Animations */}
                  <div className="flex flex-col gap-2 px-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 transition-all duration-300 hover:text-gray-800 hover:translate-x-1">
                      <div className="font-bold flex items-center">
                        <RiBuilding3Fill className="inline-block mr-1 text-gray-500 transition-all duration-300 hover:text-blue-500 hover:scale-110" />
                        <span>Companies</span>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold transition-all duration-300 hover:bg-blue-200 hover:scale-105">
                        {orgStats.total}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 transition-all duration-300 hover:text-gray-800 hover:translate-x-1">
                      <div className="font-bold flex items-center">
                        <FaUserShield className="inline-block mr-1 text-gray-500 transition-all duration-300 hover:text-green-500 hover:scale-110" />
                        <span>Users</span>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold transition-all duration-300 hover:bg-green-200 hover:scale-105">
                        {secUserStats.total}
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 opacity-0 group-hover:opacity-10 transition-all duration-500" />
              </Card>
            );
          })}
        </div>

        {/* Animated Pagination */}
        {filteredData.length > 0 && (
          <div className={`flex items-center justify-between transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <p className="text-sm text-gray-600 transition-all duration-300 hover:text-gray-800">
              Showing {firstPostIndex + 1} to{" "}
              {lastPostIndex > filteredData.length
                ? filteredData.length
                : lastPostIndex}{" "}
              of {filteredData.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 hover:bg-gray-200">
                Page {currentPage} of {Math.ceil(filteredData.length / postPerPage)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(Math.ceil(filteredData.length / postPerPage), currentPage + 1))}
                disabled={currentPage === Math.ceil(filteredData.length / postPerPage)}
                className="transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Animated Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-12 transform transition-all duration-700 hover:scale-105">
            <div className="animate-bounce">
              <FiUsers className="h-16 w-16 text-gray-300 mx-auto mb-4 transition-all duration-300 hover:text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-all duration-300 hover:text-gray-700">
              No users found
            </h3>
            <p className="text-gray-600 transition-all duration-300 hover:text-gray-800">
              {search || option ? "Try adjusting your search or filter." : "No primary users available."}
            </p>
          </div>
        )}
      </div>

      {/* Animated Secondary Users Popup */}
      {showSecUsers && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
          <div className="transform transition-all duration-300 scale-95 animate-slideUp">
            <SecUserPopup
              filteredSecUsers={filteredSecUsers}
              handleSecBlock={(userId) => {
                console.log("Block secondary user:", userId);
              }}
              setShowSecUsers={setShowSecUsers}
              refresh={true}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translateY(0);
          }
          40%, 43% {
            transform: translateY(-5px);
          }
          70% {
            transform: translateY(-3px);
          }
          90% {
            transform: translateY(-1px);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
          transition: background 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
}

export default PrimaryUsers;