import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {
  FiShare2,
  FiMapPin,
  FiCalendar,
  FiHome,
  FiDroplet,
  FiZap,
  FiEye,
  FiShield,
  FiMaximize,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
} from "react-icons/fi";
import { FaBed, FaBath, FaParking, FaCouch, FaSwimmingPool, FaDumbbell, FaTree } from "react-icons/fa";
import { MdKitchen } from "react-icons/md";
import { TbAirConditioning } from "react-icons/tb";
import {
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
const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url) return null;
  
  const { width = 1200, quality = "auto", fit = "fill" } = options;
  
  if (url.includes("cloudinary.com")) {
    const transformations = `f_auto,q_${quality},w_${width},c_${fit}`;
    
    if (url.includes("/upload/")) {
      return url.replace("/upload/", `/upload/${transformations}/`);
    }
  }
  
  return url;
};

const SingleListing = () => {
  const { listingId } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const thumbnailContainerRef = useRef(null);

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
        <div className="text-center px-4">
          <FiHome className="w-16 h-16 text-ink-muted mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-ink mb-2">Listing Not Found</h1>
          <p className="text-ink-muted">The property you're looking for doesn't exist or has been removed.</p>
        </div>
      </main>
    );
  }

  // Destructure listing data
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

  // Short address for display
  const getShortAddress = () => {
    if (typeof address === "string") return address;
    const parts = [address.city, address.state, address.country].filter(Boolean);
    return parts.join(", ") || "Location not specified";
  };

  // Format price
  const formatPrice = (amount) => {
    const symbol = CURRENCY_SYMBOLS[currency] || "₹";
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  // Get all images
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

  // Image navigation
  const goToImage = (index) => {
    setActiveImageIndex(index);
    // Scroll thumbnail into view
    if (thumbnailContainerRef.current) {
      const thumbnails = thumbnailContainerRef.current.children;
      if (thumbnails[index]) {
        thumbnails[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  const nextImage = () => {
    const newIndex = activeImageIndex < allImages.length - 1 ? activeImageIndex + 1 : 0;
    goToImage(newIndex);
  };

  const prevImage = () => {
    const newIndex = activeImageIndex > 0 ? activeImageIndex - 1 : allImages.length - 1;
    goToImage(newIndex);
  };

  // Collect all available amenities/features
  const getAmenities = () => {
    const amenities = [];
    if (parking) amenities.push({ icon: FaParking, label: "Parking" });
    if (furnished) amenities.push({ icon: FaCouch, label: "Furnished" });
    if (yardGarden) amenities.push({ icon: FaTree, label: "Yard/Garden" });
    if (gym) amenities.push({ icon: FaDumbbell, label: "Gym" });
    if (pool) amenities.push({ icon: FaSwimmingPool, label: "Pool" });
    if (cooling) amenities.push({ icon: TbAirConditioning, label: getLabelFromValue(COOLING_OPTIONS, cooling) });
    if (kitchenFeatures?.length > 0) amenities.push({ icon: MdKitchen, label: "Modern Kitchen" });
    return amenities;
  };

  const amenities = getAmenities();

  // Detail item component
  const DetailItem = ({ icon, label, value }) => {
    if (!value && value !== 0) return null;
    const Icon = icon
    return (
      <div className="flex items-center gap-3 text-ink-muted">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{label}:</span>
        <span className="text-sm font-medium text-ink">{value}</span>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Image Gallery */}
      <section className="relative bg-surface-100">
        {hasImages ? (
          <div className="relative">
            {/* Main Image */}
            <div className="relative aspect-[16/10] sm:aspect-[16/8] lg:aspect-[16/7] max-h-[600px] overflow-hidden">
              <img
                src={optimizeCloudinaryUrl(allImages[activeImageIndex]?.url, { width: 1600, fit: "limit" })}
                alt={`${name} - Image ${activeImageIndex + 1}`}
                className="w-full h-full object-contain bg-surface-100"
              />
              
              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-lg transition-all hover:scale-105"
                    aria-label="Previous image"
                  >
                    <FiChevronLeft className="w-5 h-5 text-ink" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-lg transition-all hover:scale-105"
                    aria-label="Next image"
                  >
                    <FiChevronRight className="w-5 h-5 text-ink" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-ink/80 backdrop-blur-sm rounded-full">
                  <span className="text-white text-sm font-medium">
                    {activeImageIndex + 1} / {allImages.length}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="bg-white border-t border-surface-200">
                <div 
                  ref={thumbnailContainerRef}
                  className="flex gap-2 p-3 overflow-x-auto scrollbar-hide max-w-6xl mx-auto"
                >
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all ${
                        activeImageIndex === index
                          ? "ring-2 ring-ink ring-offset-2"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={optimizeCloudinaryUrl(image.url, { width: 160, fit: "fill" })}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-3 bg-white/95 hover:bg-white rounded-full shadow-lg transition-all hover:scale-105"
              aria-label="Share listing"
            >
              <FiShare2 className="w-5 h-5 text-ink" />
            </button>

            {/* Share Toast */}
            {shareLinkCopied && (
              <div className="absolute top-20 right-4 px-4 py-2 bg-ink text-white text-sm font-medium rounded-lg shadow-lg animate-fade-in">
                Link copied!
              </div>
            )}

            {/* Type Badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-4 py-2 text-sm font-semibold rounded-full shadow-lg ${
                type === "rent"
                  ? "bg-blue-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}>
                For {type === "rent" ? "Rent" : "Sale"}
              </span>
            </div>
          </div>
        ) : (
          <div className="aspect-[16/9] max-h-[500px] bg-surface-200 flex items-center justify-center">
            <div className="text-center text-ink-muted">
              <FiHome className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p>No images available</p>
            </div>
          </div>
        )}
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-ink mb-2">{name}</h1>
              <div className="flex items-center gap-2 text-ink-muted">
                <FiMapPin className="w-4 h-4" />
                <span>{getShortAddress()}</span>
              </div>
            </div>
            <div className="lg:text-right">
              <p className="text-3xl font-bold text-ink">{formatPrice(price)}</p>
              <p className="text-ink-muted text-sm">
                {type === "rent" ? "per month" : ""}
                {priceType === "negotiable" && <span className="text-blue-600 ml-2">Negotiable</span>}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4 border-y border-surface-200">
            {propertyType && (
              <div className="flex items-center gap-2 text-ink">
                <FiHome className="w-5 h-5 text-ink-muted" />
                <span className="font-medium">{getLabelFromValue(PROPERTY_TYPES, propertyType)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-ink">
              <FaBed className="w-5 h-5 text-ink-muted" />
              <span className="font-medium">{bedrooms} {bedrooms === 1 ? "Bed" : "Beds"}</span>
            </div>
            <div className="flex items-center gap-2 text-ink">
              <FaBath className="w-5 h-5 text-ink-muted" />
              <span className="font-medium">{bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}</span>
            </div>
            {livingArea && (
              <div className="flex items-center gap-2 text-ink">
                <FiMaximize className="w-5 h-5 text-ink-muted" />
                <span className="font-medium">{Number(livingArea).toLocaleString()} sq ft</span>
              </div>
            )}
            {yearBuilt && (
              <div className="flex items-center gap-2 text-ink">
                <FiCalendar className="w-5 h-5 text-ink-muted" />
                <span className="font-medium">Built {yearBuilt}</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-3 space-y-8">
            {/* Description */}
            {description && (
              <section>
                <h2 className="text-lg font-semibold text-ink mb-3">About this property</h2>
                <p className="text-ink-muted leading-relaxed whitespace-pre-line">{description}</p>
              </section>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-ink mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200"
                    >
                      <amenity.icon className="w-5 h-5 text-ink" />
                      <span className="text-sm font-medium text-ink">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Property Details */}
            {(stories || ceilingHeight || floorNumber || otherRooms || flooring?.length > 0) && (
              <section>
                <h2 className="text-lg font-semibold text-ink mb-4">Property details</h2>
                <div className="space-y-4">
                  {/* Size Info */}
                  <div className="grid grid-cols-2 gap-4">
                    {stories && <DetailItem icon={FiGrid} label="Stories" value={stories} />}
                    {ceilingHeight && <DetailItem icon={FiMaximize} label="Ceiling" value={ceilingHeight} />}
                    {floorNumber && <DetailItem icon={FiGrid} label="Floor" value={floorNumber} />}
                  </div>

                  {/* Other Rooms */}
                  {otherRooms && (
                    <div>
                      <p className="text-sm text-ink-muted mb-1">Other rooms</p>
                      <p className="text-ink">{otherRooms}</p>
                    </div>
                  )}

                  {/* Flooring */}
                  {flooring?.length > 0 && (
                    <div>
                      <p className="text-sm text-ink-muted mb-2">Flooring</p>
                      <div className="flex flex-wrap gap-2">
                        {getLabelsFromValues(FLOORING_OPTIONS, flooring)?.map((label, i) => (
                          <span key={i} className="px-3 py-1 text-sm bg-surface-100 text-ink rounded-full">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Kitchen Features */}
                  {kitchenFeatures?.length > 0 && (
                    <div>
                      <p className="text-sm text-ink-muted mb-2">Kitchen features</p>
                      <div className="flex flex-wrap gap-2">
                        {getLabelsFromValues(KITCHEN_FEATURES, kitchenFeatures)?.map((label, i) => (
                          <span key={i} className="px-3 py-1 text-sm bg-surface-100 text-ink rounded-full">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Utilities */}
            {(plumbing || electrical || waterSource || accessibilityFeatures) && (
              <section>
                <h2 className="text-lg font-semibold text-ink mb-4">Utilities & Infrastructure</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plumbing && <DetailItem icon={FiDroplet} label="Plumbing" value={plumbing} />}
                  {electrical && <DetailItem icon={FiZap} label="Electrical" value={electrical} />}
                  {waterSource && <DetailItem icon={FiDroplet} label="Water" value={waterSource} />}
                  {accessibilityFeatures && <DetailItem icon={FiShield} label="Accessibility" value={accessibilityFeatures} />}
                </div>
              </section>
            )}

            {/* Views & Privacy */}
            {(view || privacy) && (
              <section>
                <h2 className="text-lg font-semibold text-ink mb-4">Views & Privacy</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {view && <DetailItem icon={FiEye} label="View" value={view} />}
                  {privacy && <DetailItem icon={FiShield} label="Privacy" value={privacy} />}
                </div>
              </section>
            )}

            {/* Building Rules */}
            {buildingRules && (
              <section>
                <h2 className="text-lg font-semibold text-ink mb-3">Building rules</h2>
                <p className="text-ink-muted leading-relaxed whitespace-pre-line">{buildingRules}</p>
              </section>
            )}
          </div>

          {/* Right Column - Pricing & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pricing Card */}
            <div className="bg-surface-50 rounded-2xl p-5 border border-surface-200 sticky top-20">
              <h3 className="text-lg font-semibold text-ink mb-4">Pricing</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-surface-200">
                  <span className="text-ink-muted">{type === "rent" ? "Monthly rent" : "Price"}</span>
                  <span className="text-xl font-bold text-ink">{formatPrice(price)}</span>
                </div>

                {securityDeposit && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-ink-muted text-sm">Security deposit</span>
                    <span className="font-medium text-ink">{formatPrice(securityDeposit)}</span>
                  </div>
                )}

                {maintenanceFee && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-ink-muted text-sm">Maintenance fee</span>
                    <span className="font-medium text-ink">{formatPrice(maintenanceFee)}</span>
                  </div>
                )}

                {tax && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-ink-muted text-sm">Tax</span>
                    <span className="font-medium text-ink">{tax}%</span>
                  </div>
                )}

                {leaseTerm && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-ink-muted text-sm">Lease term</span>
                    <span className="font-medium text-ink">{getLabelFromValue(LEASE_TERM_OPTIONS, leaseTerm)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Card */}
            {hasCoordinates && (
              <div className="bg-surface-50 rounded-2xl overflow-hidden border border-surface-200">
                <div className="p-4 border-b border-surface-200">
                  <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    Location
                  </h3>
                </div>
                <div className="h-[280px]">
                  <MapContainer
                    center={[+geolocation.lat, +geolocation.lng]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[+geolocation.lat, +geolocation.lng]}>
                      <Popup>
                        <div className="text-center p-1">
                          <p className="font-semibold text-sm">{name}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-sm text-ink-muted">{formatFullAddress()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SingleListing;
