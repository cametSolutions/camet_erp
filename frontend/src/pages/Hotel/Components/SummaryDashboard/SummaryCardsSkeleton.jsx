import { Skeleton } from "@/components/ui/skeleton";

const SummaryCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl p-5 min-h-[130px] flex flex-col justify-between"
        >
          <Skeleton className="absolute inset-0 rounded-2xl" />
          <div className="z-10 space-y-3 mt-8">
            <Skeleton className="h-2.5 w-20 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-2 w-24 rounded-full" />
          </div>
          {/* Fake cash/bank row */}
          <div className="z-10 mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCardsSkeleton;