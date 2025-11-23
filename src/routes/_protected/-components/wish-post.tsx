import { Gift } from "lucide-react";

export function WishPost() {}

interface WishCardProps {
  brand: string;
  title: string;
  price: string;
  image: string;
  desire?: string;
  isGift?: boolean;
  className?: string;
}

export function WishPost1({
  brand,
  title,
  price,
  image,
  desire = "I want this!",
  isGift = true,
  className = "",
}: WishCardProps) {
  return (
    <div
      className={`card border border-neutral/50 p-4 shadow-sm hover:shadow-lg transition-all duration-300 ${className}`}
    >
      {/* Product Image */}
      <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="h-full w-full object-contain p-4 transition-transform duration-300 hover:scale-110"
        />
      </div>

      {/* Brand */}
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
        {brand}
      </p>

      {/* Title */}
      <h3 className="mb-2 line-clamp-2 text-pretty text-sm font-medium leading-snug text-gray-900">
        {title}
      </h3>

      {/* Desire Text */}
      <p className="mb-3 text-xs font-medium text-[#6366f1]">{desire}</p>

      {/* Price */}
      <p className="mb-4 text-2xl font-bold text-gray-900">{price}</p>

      {/* Gift Button */}
      {isGift && (
        <button className="w-full btn rounded-full bg-gradient-to-r from-[#e0e7ff] to-[#ddd6fe] py-6 font-semibold text-[#6366f1] transition-all hover:from-[#c7d2fe] hover:to-[#ddd6fe] hover:shadow-md">
          <Gift className="mr-2 h-5 w-5" />
          Gift
        </button>
      )}
    </div>
  );
}
