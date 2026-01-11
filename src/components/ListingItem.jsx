import React from "react";
import { Link } from "react-router-dom";
import { useFromNow } from "../hooks/useFromNow";
import { FiMapPin, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaBed, FaBath } from "react-icons/fa";

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};

const formatAddress = (listing) => {
  if (listing.address && typeof listing.address === "object") {
    const { street, city, state } = listing.address;
    const parts = [street, city, state].filter(Boolean);
    return parts.join(", ") || listing.address.country || "Location not specified";
  }
  // Fallback for old format (address as string)
  return listing.address || "Location not specified";
};

const getMainImageUrl = (listing) => {
  // New format: mainPhoto object with url
  if (listing.mainPhoto?.url) {
    return listing.mainPhoto.url;
  }
  // Old format: imgUrls array
  if (listing.imgUrls?.length > 0) {
    return listing.imgUrls[0];
  }
  // Placeholder
  return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60";
};

const formatPrice = (listing) => {
  const price = listing.price || listing.regularPrice || listing.discountedPrice || 0;
  const currency = listing.currency || "INR";
  const symbol = CURRENCY_SYMBOLS[currency] || "₹";
  
  return `${symbol}${price.toLocaleString()}`;
};

const ListingItem = ({ listing, id, onDelete, onEdit }) => {
  const { type, timestamp, name, bedrooms, bathrooms } = listing;
  const fromNowListingTime = useFromNow(timestamp);
  const imageUrl = getMainImageUrl(listing);
  const address = formatAddress(listing);
  const formattedPrice = formatPrice(listing);

  return (
    <li className="group relative bg-white rounded-2xl shadow-soft hover:shadow-soft-lg overflow-hidden transition-all duration-300 ease-smooth">
      <Link to={`/category/${type}/${id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-100">
          <img
            className="w-full h-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
            src={imageUrl}
            alt={name}
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Time Badge */}
          <span className="absolute top-3 left-3 bg-ink/80 backdrop-blur-sm text-white text-xs font-medium rounded-lg px-2 py-1 shadow-soft">
            {fromNowListingTime}
          </span>
          
          {/* Type Badge */}
          <span className={`absolute top-3 right-3 text-xs font-semibold uppercase tracking-wide rounded-lg px-2 py-1 shadow-soft ${
            type === "rent" 
              ? "bg-accent text-white" 
              : "bg-success text-white"
          }`}>
            {type === "rent" ? "Rent" : "Sale"}
          </span>
        </div>

        <div className="p-3">
          {/* Address */}
          <div className="flex items-start gap-1.5 mb-2">
            <FiMapPin className="w-4 h-4 text-ink-muted mt-0.5 flex-shrink-0" />
            <p className="text-sm text-ink-muted truncate leading-tight">
              {address}
            </p>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-ink text-md leading-snug truncate mb-3">
            {name}
          </h3>

          {/* Price */}
          <p className="text-lg font-bold text-ink mb-3">
            {formattedPrice}
            {type === "rent" && (
              <span className="text-sm font-normal text-ink-muted">/month</span>
            )}
          </p>

          {/* Features */}
          <div className="flex items-center gap-4 pt-3 border-t border-surface-200">
            <div className="flex items-center gap-1.5 text-ink-muted">
              <FaBed className="w-4 h-4" />
              <span className="text-sm font-medium">
                {bedrooms} {bedrooms === 1 ? "Bed" : "Beds"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-ink-muted">
              <FaBath className="w-4 h-4" />
              <span className="text-sm font-medium">
                {bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action Buttons - Only shown on Profile page */}
      {(onDelete || onEdit) && (
        <div className="absolute bottom-2 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit(id);
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-soft hover:bg-ink hover:text-white transition-all duration-200"
              aria-label="Edit listing"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(id);
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-soft hover:bg-error hover:text-white transition-all duration-200"
              aria-label="Delete listing"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </li>
  );
};

export default ListingItem;
