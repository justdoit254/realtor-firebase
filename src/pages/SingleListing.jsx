import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import SwiperCore from "swiper";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {
  FiShare2,
  FiMapPin,
  FiCalendar,
  FiGrid,
  FiHome,
  FiDollarSign,
  FiCheck,
  FiX,
  FiDroplet,
  FiZap,
  FiWind,
  FiEye,
  FiShield,
  FiFileText,
  FiLayers,
  FiMaximize,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { FaBed, FaBath, FaParking, FaChair, FaSwimmingPool, FaDumbbell } from "react-icons/fa";
import { PiPlant } from "react-icons/pi";
import {
  CURRENCIES,
  PROPERTY_TYPES,
  FLOORING_OPTIONS,
  KITCHEN_FEATURES,
  COOLING_OPTIONS,
  LEASE_TERM_OPTIONS,
} from "../constants";

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};

// Helper to get label from options array
const getLabelFromValue = (options, value) => {
  const option = options.find((opt) => opt.value === value);
  return option ? option.label : value;
};

// Helper to get labels from array of values
const getLabelsFromValues = (options, values) => {
  if (!Array.isArray(values) || values.length === 0) return null;
  return values.map((val) => getLabelFromValue(options, val));
};

// Cloudinary image optimization helper
// Transforms Cloudinary URLs to use optimal format (WebP for supported browsers)
const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url) return null;
  
  const { width = 1200, quality = "auto" } = options;
  
  // Check if it's a Cloudinary URL
  if (url.includes("cloudinary.com")) {
    // Insert transformation parameters before /upload/
    // f_auto: auto format (WebP for supported browsers, else best alternative)
    // q_auto: auto quality optimization
    // w_: width for responsive sizing
    const transformations = `f_auto,q_${quality},w_${width}`;
    
    // Handle URLs with or without existing transformations
    if (url.includes("/upload/")) {
      return url.replace("/upload/", `/upload/${transformations}/`);
    }
  }
  
  return url;
};

// Get optimized image URL with srcset for responsive images
const getOptimizedImageSrcSet = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  
  const sizes = [400, 800, 1200, 1600];
  return sizes
    .map((w) => `${optimizeCloudinaryUrl(url, { width: w })} ${w}w`)
    .join(", ");
};

const SingleListing = () => {
  const { listingId } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  // const [activeImageIndex, setActiveImageIndex] = useState(0);

  SwiperCore.use([Autoplay, Navigation, Pagination]);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "listings", listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setListing(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
  };

  if (loading) {
    return <Spinner />;
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <FiHome className="w-16 h-16 text-ink-muted mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-ink mb-2">Listing Not Found</h1>
          <p className="text-ink-muted">The property you're looking for doesn't exist or has been removed.</p>
        </div>
      </main>
    );
  }

  // Destructure listing data with defaults
  const {
    type = "rent",
    name = "Untitled Property",
    description = "",
    propertyType = "",
    address = {},
    geolocation = {},
    price = 0,
    currency = "INR",
    priceType = "fixed",
    securityDeposit,
    tax,
    maintenanceFee,
    leaseTerm,
    yearBuilt,
    livingArea,
    bedrooms = 0,
    bathrooms = 0,
    otherRooms,
    stories,
    ceilingHeight,
    floorNumber,
    parking = false,
    furnished = false,
    flooring = [],
    kitchenFeatures = [],
    cooling,
    accessibilityFeatures,
    plumbing,
    electrical,
    waterSource,
    yardGarden = false,
    view,
    gym = false,
    pool = false,
    privacy,
    buildingRules,
    mainPhoto,
    additionalPhotos = [],
  } = listing;

  // Format address
  const formatFullAddress = () => {
    if (typeof address === "string") return address;
    
    const parts = [];
    if (address.plotNumber) parts.push(address.plotNumber);
    if (address.street) parts.push(address.street);
    if (address.region) parts.push(address.region);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);
    if (address.postalCode) parts.push(address.postalCode);
    
    return parts.join(", ") || "Location not specified";
  };

  // Format price with currency symbol
  const formatPrice = (amount) => {
    const symbol = CURRENCY_SYMBOLS[currency] || "₹";
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  // Get all images for gallery
  const getAllImages = () => {
    const images = [];
    if (mainPhoto?.url) {
      images.push({ url: mainPhoto.url, isMain: true });
    }
    if (additionalPhotos?.length > 0) {
      additionalPhotos.forEach((photo) => {
        if (photo?.url) {
          images.push({ url: photo.url, isMain: false });
        }
      });
    }
    return images;
  };

  const allImages = getAllImages();
  const hasImages = allImages.length > 0;
  const hasCoordinates = geolocation?.lat && geolocation?.lng;

  // Section component for consistent styling
  const Section = ({ icon: Icon, title, children, className = "" }) => (
    <section className={`${className}`}>
      <h3 className="flex items-center gap-2 text-lg font-semibold text-ink mb-4">
        {Icon && <Icon className="w-5 h-5" />}
        {title}
      </h3>
      {children}
    </section>
  );

  // Info row component
  const InfoRow = ({ label, value, icon: Icon }) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex items-start gap-3 py-2">
        {Icon && <Icon className="w-4 h-4 text-ink-muted mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <span className="text-sm text-ink-muted">{label}</span>
          <p className="text-ink font-medium">{value}</p>
        </div>
      </div>
    );
  };

  // Feature badge component
  const FeatureBadge = ({ active, label, icon: Icon }) => (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
        active
          ? "bg-success/10 text-success"
          : "bg-surface-100 text-ink-muted"
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
      {active ? (
        <FiCheck className="w-4 h-4 ml-auto" />
      ) : (
        <FiX className="w-4 h-4 ml-auto" />
      )}
    </div>
  );

  // Tag component for arrays
  const Tag = ({ children }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-surface-100 text-ink">
      {children}
    </span>
  );

  return (
    <main className="min-h-screen bg-surface-50">
      {/* Image Gallery Section */}
      <div className="relative bg-ink">
        {hasImages ? (
          <Swiper
            slidesPerView={1}
            navigation={{
              prevEl: ".swiper-button-prev-custom",
              nextEl: ".swiper-button-next-custom",
            }}
            pagination={{ 
              type: "fraction",
              el: ".swiper-pagination-custom",
            }}
            effect="fade"
            modules={[EffectFade, Navigation, Pagination]}
            autoplay={{ delay: 4000 }}
            // onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
            className="relative"
          >
            {allImages.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px]">
                  <picture>
                    <source
                      type="image/webp"
                      srcSet={getOptimizedImageSrcSet(image.url)}
                      sizes="100vw"
                    />
                    <img
                      src={optimizeCloudinaryUrl(image.url, { width: 1200 })}
                      srcSet={getOptimizedImageSrcSet(image.url)}
                      sizes="100vw"
                      alt={`${name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </picture>
                  {/* Gradient overlay for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/20" />
                </div>
              </SwiperSlide>
            ))}
            
            {/* Custom Navigation */}
            {allImages.length > 1 && (
              <>
                <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-white transition-colors">
                  <FiChevronLeft className="w-5 h-5 text-ink" />
                </button>
                <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-white transition-colors">
                  <FiChevronRight className="w-5 h-5 text-ink" />
                </button>
                
                {/* Custom Pagination */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 bg-ink/70 backdrop-blur-sm rounded-full">
                  <span className="swiper-pagination-custom text-white text-sm font-medium" />
                </div>
              </>
            )}
          </Swiper>
        ) : (
          <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-surface-200 flex items-center justify-center">
            <div className="text-center text-ink-muted">
              <FiHome className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p>No images available</p>
            </div>
          </div>
        )}

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-white transition-colors"
          aria-label="Share listing"
        >
          <FiShare2 className="w-5 h-5 text-ink" />
        </button>

        {/* Share Copied Toast */}
        {shareLinkCopied && (
          <div className="absolute top-16 right-4 z-20 px-4 py-2 bg-success text-white text-sm font-medium rounded-lg shadow-lg animate-fade-in">
            Link copied!
          </div>
        )}

        {/* Type Badge */}
        <span
          className={`absolute top-4 left-4 z-20 px-4 py-2 text-sm font-semibold uppercase tracking-wide rounded-lg shadow-soft ${
            type === "rent"
              ? "bg-accent text-white"
              : "bg-success text-white"
          }`}
        >
          For {type === "rent" ? "Rent" : "Sale"}
        </span>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="card-elevated animate-fade-in-up">
              {/* Title & Price */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl lg:text-3xl font-bold text-ink mb-2">
                    {name}
                  </h1>
                  <div className="flex items-start gap-2 text-ink-muted">
                    <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{formatFullAddress()}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-ink">
                    {formatPrice(price)}
                  </p>
                  {type === "rent" && (
                    <span className="text-sm text-ink-muted">/month</span>
                  )}
                  {priceType === "negotiable" && (
                    <span className="block text-xs text-accent font-medium mt-1">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>

              <div className="divider" />

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 py-2">
                {propertyType && (
                  <div className="flex items-center gap-2">
                    <FiHome className="w-5 h-5 text-ink-muted" />
                    <span className="text-sm font-medium text-ink">
                      {getLabelFromValue(PROPERTY_TYPES, propertyType)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaBed className="w-5 h-5 text-ink-muted" />
                  <span className="text-sm font-medium text-ink">
                    {bedrooms} {bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaBath className="w-5 h-5 text-ink-muted" />
                  <span className="text-sm font-medium text-ink">
                    {bathrooms} {bathrooms === 1 ? "Bathroom" : "Bathrooms"}
                  </span>
                </div>
                {livingArea && (
                  <div className="flex items-center gap-2">
                    <FiMaximize className="w-5 h-5 text-ink-muted" />
                    <span className="text-sm font-medium text-ink">
                      {Number(livingArea).toLocaleString()} sq ft
                    </span>
                  </div>
                )}
                {yearBuilt && (
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-ink-muted" />
                    <span className="text-sm font-medium text-ink">
                      Built {yearBuilt}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="card-elevated animate-fade-in-up">
                <Section icon={FiFileText} title="Description">
                  <p className="text-ink-muted leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </Section>
              </div>
            )}

            {/* Key Features */}
            <div className="card-elevated animate-fade-in-up">
              <Section icon={FiCheck} title="Key Features">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <FeatureBadge active={parking} label="Parking" icon={FaParking} />
                  <FeatureBadge active={furnished} label="Furnished" icon={FaChair} />
                  <FeatureBadge active={yardGarden} label="Yard/Garden" icon={PiPlant} />
                  <FeatureBadge active={gym} label="Gym" icon={FaDumbbell} />
                  <FeatureBadge active={pool} label="Pool" icon={FaSwimmingPool} />
                </div>
              </Section>
            </div>

            {/* Size & Layout */}
            {(livingArea || stories || ceilingHeight || floorNumber || otherRooms) && (
              <div className="card-elevated animate-fade-in-up">
                <Section icon={FiGrid} title="Size & Layout">
                  <div className="grid grid-cols-2 gap-4">
                    {livingArea && (
                      <InfoRow
                        label="Living Area"
                        value={`${Number(livingArea).toLocaleString()} sq ft`}
                        icon={FiMaximize}
                      />
                    )}
                    {stories && (
                      <InfoRow
                        label="Stories/Floors"
                        value={stories}
                        icon={FiLayers}
                      />
                    )}
                    {ceilingHeight && (
                      <InfoRow
                        label="Ceiling Height"
                        value={ceilingHeight}
                      />
                    )}
                    {floorNumber && (
                      <InfoRow
                        label="Floor Number"
                        value={floorNumber}
                      />
                    )}
                  </div>
                  {otherRooms && (
                    <div className="mt-4 pt-4 border-t border-surface-200">
                      <p className="text-sm text-ink-muted mb-2">Other Rooms</p>
                      <p className="text-ink">{otherRooms}</p>
                    </div>
                  )}
                </Section>
              </div>
            )}

            {/* Interior Features */}
            {(flooring?.length > 0 || kitchenFeatures?.length > 0 || cooling) && (
              <div className="card-elevated animate-fade-in-up">
                <Section icon={FiHome} title="Interior Features">
                  {flooring?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-ink-muted mb-2">Flooring</p>
                      <div className="flex flex-wrap gap-2">
                        {getLabelsFromValues(FLOORING_OPTIONS, flooring)?.map((label, i) => (
                          <Tag key={i}>{label}</Tag>
                        ))}
                      </div>
                    </div>
                  )}
                  {kitchenFeatures?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-ink-muted mb-2">Kitchen Features</p>
                      <div className="flex flex-wrap gap-2">
                        {getLabelsFromValues(KITCHEN_FEATURES, kitchenFeatures)?.map((label, i) => (
                          <Tag key={i}>{label}</Tag>
                        ))}
                      </div>
                    </div>
                  )}
                  {cooling && (
                    <div>
                      <p className="text-sm text-ink-muted mb-2">Cooling</p>
                      <Tag>{getLabelFromValue(COOLING_OPTIONS, cooling)}</Tag>
                    </div>
                  )}
                </Section>
              </div>
            )}

            {/* Utilities & Infrastructure */}
            {(plumbing || electrical || waterSource || accessibilityFeatures) && (
              <div className="card-elevated animate-fade-in-up">
                <Section icon={FiZap} title="Utilities & Infrastructure">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {plumbing && (
                      <InfoRow label="Plumbing" value={plumbing} icon={FiDroplet} />
                    )}
                    {electrical && (
                      <InfoRow label="Electrical" value={electrical} icon={FiZap} />
                    )}
                    {waterSource && (
                      <InfoRow label="Water Source" value={waterSource} icon={FiDroplet} />
                    )}
                    {accessibilityFeatures && (
                      <InfoRow label="Accessibility" value={accessibilityFeatures} />
                    )}
                  </div>
                </Section>
              </div>
            )}

            {/* Outdoor & Views */}
            {(view || privacy) && (
              <div className="card-elevated animate-fade-in-up">
                <Section icon={FiEye} title="Outdoor & Views">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {view && (
                      <InfoRow label="View" value={view} icon={FiEye} />
                    )}
                    {privacy && (
                      <InfoRow label="Privacy" value={privacy} icon={FiShield} />
                    )}
                  </div>
                </Section>
              </div>
            )}

            {/* Building Rules */}
            {buildingRules && (
              <div className="card-elevated animate-fade-in-up">
                <Section icon={FiShield} title="Building Rules">
                  <p className="text-ink-muted leading-relaxed whitespace-pre-line">
                    {buildingRules}
                  </p>
                </Section>
              </div>
            )}
          </div>

          {/* Right Column - Pricing & Map */}
          <div className="space-y-6">
            {/* Pricing Details */}
            {(securityDeposit || tax || maintenanceFee || leaseTerm) && (
              <div className="card-elevated animate-fade-in-up">
                <Section icon={FiDollarSign} title="Pricing Details">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-surface-200">
                      <span className="text-ink-muted">
                        {type === "rent" ? "Monthly Rent" : "Sale Price"}
                      </span>
                      <span className="font-semibold text-ink">
                        {formatPrice(price)}
                      </span>
                    </div>
                    {securityDeposit && (
                      <div className="flex justify-between items-center py-2 border-b border-surface-200">
                        <span className="text-ink-muted">Security Deposit</span>
                        <span className="font-medium text-ink">
                          {formatPrice(securityDeposit)}
                        </span>
                      </div>
                    )}
                    {maintenanceFee && (
                      <div className="flex justify-between items-center py-2 border-b border-surface-200">
                        <span className="text-ink-muted">Maintenance Fee</span>
                        <span className="font-medium text-ink">
                          {formatPrice(maintenanceFee)}
                        </span>
                      </div>
                    )}
                    {tax && (
                      <div className="flex justify-between items-center py-2 border-b border-surface-200">
                        <span className="text-ink-muted">Tax</span>
                        <span className="font-medium text-ink">{tax}%</span>
                      </div>
                    )}
                    {leaseTerm && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-ink-muted">Lease Term</span>
                        <span className="font-medium text-ink">
                          {getLabelFromValue(LEASE_TERM_OPTIONS, leaseTerm)}
                        </span>
                      </div>
                    )}
                  </div>
                </Section>
              </div>
            )}

            {/* Map */}
            {hasCoordinates && (
              <div className="card-elevated animate-fade-in-up">
                <Section icon={FiMapPin} title="Location">
                  <div className="h-[300px] lg:h-[350px] rounded-xl overflow-hidden -mx-1">
                    <MapContainer
                      center={[+geolocation.lat, +geolocation.lng]}
                      zoom={15}
                      scrollWheelZoom={false}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[+geolocation.lat, +geolocation.lng]}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold">{name}</p>
                            <p className="text-sm text-gray-600">{formatFullAddress()}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <p className="text-sm text-ink-muted mt-3 text-center">
                    {formatFullAddress()}
                  </p>
                </Section>
              </div>
            )}

            {/* Property Snapshot (Mobile Summary) */}
            <div className="card-elevated animate-fade-in-up lg:hidden">
              <h3 className="text-lg font-semibold text-ink mb-4">Quick Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-ink-muted">Type</span>
                  <p className="font-medium text-ink capitalize">{type}</p>
                </div>
                {propertyType && (
                  <div>
                    <span className="text-ink-muted">Property</span>
                    <p className="font-medium text-ink">
                      {getLabelFromValue(PROPERTY_TYPES, propertyType)}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-ink-muted">Bedrooms</span>
                  <p className="font-medium text-ink">{bedrooms}</p>
                </div>
                <div>
                  <span className="text-ink-muted">Bathrooms</span>
                  <p className="font-medium text-ink">{bathrooms}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SingleListing;
