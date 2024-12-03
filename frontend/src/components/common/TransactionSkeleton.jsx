/* eslint-disable react/prop-types */
import React from "react";

const TransactionSkeleton = ({ count = 5 }) => {
  const SkeletonItem = () => (
    <div className="w-full bg-white rounded-sm shadow-lg border border-gray-100 flex flex-col justify-between px-4 animate-pulse">
      <div className="flex w-full items-center">
        <div className="w-3/4">
          {/* Voucher Number Skeleton */}
          <div className="text-xs mt-2 px-2 ">
            <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
          </div>

          {/* Party Name Skeleton */}
          <div className="text-xs px-2 ">
            <div className="h-4 bg-gray-300 rounded w-3/4 mt-2"></div>
          </div>

          {/* Date and Type Skeleton */}
          <div className="flex justify-between items-center mb-2">
            <div className="px-2 py-2 lg:px-6 lg:py-1 w-[300px] flex justify-center items-start relative flex-col">
              <div className="flex gap-1 items-center">
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4 ml-2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Skeleton */}
        <div className="flex-1 flex justify-end">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>

      {/* Secondary User Section Skeleton */}
      <hr className="mx-[-16px]" />
      <div className="flex justify-between flex-wrap pl-5 pr-4 py-3 bg-gray-100 mx-[-16px] items-center">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 text-center pb-2 mt-2 md:px-2 overflow-hidden">
      {[...Array(count)].map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </div>
  );
};

export default React.memo(TransactionSkeleton);