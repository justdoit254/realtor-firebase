/**
 * Geocoding utility using OpenStreetMap Nominatim API
 * Free, no API key required
 * Rate limit: 1 request per second (handled by caller)
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Build a full address string from form data
 */
export const buildAddressString = (formData) => {
  const parts = [
    formData.plotNumber,
    formData.streetAddress,
    formData.region,
    formData.city,
    formData.state,
    formData.postalCode,
    formData.country,
  ].filter(Boolean);
  
  return parts.join(", ");
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Fetch coordinates from address using Nominatim API
 * @param {Object} formData - Form data containing address fields
 * @returns {Promise<{lat: number, lng: number}>}
 * @throws {Error} If address not found or API error
 */
export const geocodeAddress = async (formData) => {
  const address = buildAddressString(formData);
  
  if (!address.trim()) {
    throw new Error("Address is empty");
  }

  const params = new URLSearchParams({
    q: address,
    format: "json",
    limit: "1",
  });

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`, {
      headers: {
        // Nominatim requires a User-Agent header (their usage policy)
        "User-Agent": "RealEstateListingApp/1.0",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Please wait a moment and try again.");
      }
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(
        "Could not find coordinates. Please enter correct address."
      );
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection.");
    }
    throw error;
  }
};

/**
 * Verify user-provided coordinates against geocoded address
 * @param {Object} formData - Form data with address and coordinates
 * @param {number} maxDistance - Maximum allowed distance in km (default: 3)
 * @returns {Promise<{valid: boolean, distance: number, geocoded: {lat, lng}}>}
 */
export const verifyCoordinates = async (formData, maxDistance = 3) => {
  const userLat = parseFloat(formData.latitude);
  const userLng = parseFloat(formData.longitude);

  if (isNaN(userLat) || isNaN(userLng)) {
    return { valid: false, error: "Invalid coordinate format" };
  }

  // Validate coordinate ranges
  if (userLat < -90 || userLat > 90) {
    return { valid: false, error: "Latitude must be between -90 and 90" };
  }
  if (userLng < -180 || userLng > 180) {
    return { valid: false, error: "Longitude must be between -180 and 180" };
  }

  try {
    const geocoded = await geocodeAddress(formData);
    const distance = calculateDistance(userLat, userLng, geocoded.lat, geocoded.lng);

    return {
      valid: distance <= maxDistance,
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      geocoded,
      userProvided: { lat: userLat, lng: userLng },
    };
  } catch (error) {
    // If geocoding fails, we can't verify - but user coordinates are valid format
    // In this case, we trust the user's input
    return {
      valid: true,
      distance: null,
      error: `Could not verify: ${error.message}`,
      userProvided: { lat: userLat, lng: userLng },
    };
  }
};

/**
 * Main function to handle geolocation for the form
 * - If coordinates provided: verify they're within acceptable range of address
 * - If coordinates empty: fetch from address
 * @param {Object} formData - Form data
 * @param {Object} options - { maxDistance: number }
 * @returns {Promise<{lat: number, lng: number, source: 'user'|'geocoded', verified: boolean}>}
 */
export const handleGeolocation = async (formData, options = {}) => {
  const { maxDistance = 3 } = options;
  
  const hasUserCoords = formData.latitude && formData.longitude;

  if (hasUserCoords) {
    const verification = await verifyCoordinates(formData, maxDistance);
    
    if (!verification.valid && verification.distance !== null) {
      throw new Error(
        `Coordinates are ${verification.distance}km away from the address (max ${maxDistance}km allowed). ` +
        `Please verify the address or coordinates.`
      );
    }

    return {
      lat: verification.userProvided.lat,
      lng: verification.userProvided.lng,
      source: "user",
      verified: verification.distance !== null,
      distance: verification.distance,
    };
  } else {
    const geocoded = await geocodeAddress(formData);
    
    return {
      lat: geocoded.lat,
      lng: geocoded.lng,
      source: "geocoded",
      verified: true,
    };
  }
};

