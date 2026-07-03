import { Skeleton } from "@/components/ui/skeleton";

const SummaryCardsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl p-4 sm:p-[18px] min-h-[126px] flex flex-col justify-between bg-white"
          >
            <Skeleton className="absolute inset-0 rounded-2xl" />
            <div className="z-10 space-y-3 mt-8">
              <Skeleton className="h-2.5 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-md" />
              <Skeleton className="h-2 w-20 rounded-full" />
            </div>
            <div className="z-10 mt-3 pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="mt-2 h-4 w-72 rounded-md" />
        </div>

        <div className="px-4 py-2 sm:px-5">
          <div className="grid grid-cols-[1.2fr_1fr] gap-4 py-3">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="grid grid-cols-[1.2fr_1fr] gap-4 border-t border-slate-100 py-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 w-40 rounded-md" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-full max-w-[280px] rounded-sm" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryCardsSkeleton;
