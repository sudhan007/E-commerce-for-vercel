import React from "react";
import { X } from "lucide-react";

const QuickViewSkeleton: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 items-center justify-center font-sans hidden md:flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl mx-2 bg-white rounded-none overflow-hidden shadow-2xl flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 z-20 w-10 h-10 flex items-center justify-center"
          aria-label="Close modal"
        >
          <X />
        </button>

        {/* Image Skeleton */}
        <div className="w-full md:w-[38%] flex items-center justify-center relative h-[400px] md:h-[550px]">
          <div className="w-full h-full bg-gray-200 animate-pulse" />
          {/* Dots Skeleton */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="w-full md:w-[62%] p-4 md:p-6 flex flex-col">
          {/* Brand & Product Name */}
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-3">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Tax Text */}
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mt-2" />

          {/* Size Selection Box */}
          <div className="mt-4 bg-[#F1F3F5] p-3 rounded">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-300 rounded animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
            </div>
            {/* Size Buttons */}
            <div className="flex flex-wrap gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-7 bg-gray-300 rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div className="flex gap-4 mt-3">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Color & Pattern */}
          <div className="flex items-center gap-8 mt-6 justify-between">
            <div className="flex items-center gap-3">
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gray-300 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-8">
            <div className="w-[50px] h-12 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center border border-gray-200 rounded h-12">
              <div className="w-12 h-full bg-gray-200 animate-pulse" />
              <div className="w-16 h-full bg-gray-100 animate-pulse" />
              <div className="w-12 h-full bg-gray-200 animate-pulse" />
            </div>
            <div className="flex-1 h-12 bg-gray-300 rounded animate-pulse" />
          </div>

          {/* Delivery Section */}
          <div className="border-t border-gray-200 mt-8 pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewSkeleton;