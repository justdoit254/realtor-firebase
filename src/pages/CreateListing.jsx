import React, { useState, useEffect, useCallback, useRef } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router";
import { db } from "../firebase";
import {
  FiDollarSign,
  FiGrid,
  FiCamera,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiMap,
  FiMapPin,
  FiZap,
  FiSun,
  FiShield,
  FiLoader,
} from "react-icons/fi";
import { LuSettings2 } from "react-icons/lu";
import { PiHouseSimpleBold, PiNewspaper } from "react-icons/pi";
import { LiaHouseDamageSolid } from "react-icons/lia";
import { StepIndicator, FormField, ToggleGroup, PhotoUploader, DraftRecoveryModal } from "../components/form";
import { STORAGE_KEY, INITIAL_FORM_DATA, REQUIRED_FIELDS, OPTIONAL_FIELDS, STEPS, PROPERTY_TYPES, CURRENCIES, LEASE_TERM_OPTIONS, FLOORING_OPTIONS, KITCHEN_FEATURES, COOLING_OPTIONS, BOOLEAN_OPTIONS, PRICE_TYPE_OPTIONS } from "../constants";
import { handleGeolocation, buildAddressString } from "../utils/geocoding";

//Future improvements:
// 1. Add suggestion of major countries like India, USA, UK, Canada, Australis, etc for State and city selection
// 2. Add suggestion of major cities for each state
// 3. Add logic to verify the postal code 


//Fixing percentage checks
//Color font of progress bar below info
//Height of text fields is high
//Adding image format conversion logic ✅
//Longitude and latitude calculation and validation ✅
//Mohadi upnagar, 424001, 424311, pimpladevi highschool

const CreateListing = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const steps = useRef(STEPS);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  console.log({formData})
  const [errors, setErrors] = useState({});
  
  // Cache to prevent redundant geocoding API calls
  const lastGeocodedAddress = useRef(null);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      setShowDraftPrompt(true);
    }
  }, []);

  const calculateProgress = useCallback(() => {
    const requiredTotal = REQUIRED_FIELDS.length;
    const optionalTotal = OPTIONAL_FIELDS.length;

    let requiredFilled = 0;
    let optionalFilled = 0;

    REQUIRED_FIELDS.forEach(field => {
      if (field.validate(formData[field.key])) {
        requiredFilled++;
      }
    });

    OPTIONAL_FIELDS.forEach(field => {
      if (field.validate(formData[field.key])) {
        optionalFilled++;
      }
    });

    // Required fields contribute 80%, optional contribute 20%
    const requiredPercentage = (requiredFilled / requiredTotal) * 80;
    const optionalPercentage = (optionalFilled / optionalTotal) * 20;
    const totalPercentage = requiredPercentage + optionalPercentage;

    return {
      percentage: Math.min(100, totalPercentage),
      requiredPercentage: Math.round((requiredFilled / requiredTotal) * 100),
      optionalPercentage: Math.round((optionalFilled / optionalTotal) * 100),
      requiredFilled,
      requiredTotal,
      optionalFilled,
      optionalTotal,
      canSubmit: requiredFilled === requiredTotal,
    };
  }, [formData]);

  const progress = calculateProgress();

  const shouldSave = useCallback(() => {
    const { type, name, description, streetAddress, city, state, country, postalCode, price, yearBuilt } = formData;
    return type && name && description && streetAddress && city && state && country && postalCode && price && yearBuilt;
  }, [formData]);

  if (shouldSave()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        lastGeocodedAddress.current = `${buildAddressString(parsed)}::${parsed.latitude}|${parsed.longitude}`;
        setFormData(parsed);
        toast.success("Draft restored successfully");
      } catch {
        toast.error("Failed to restore draft");
      }
    }
    setShowDraftPrompt(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowDraftPrompt(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Multi-select handler for arrays
  const handleMultiSelect = (name, value) => {
    setFormData((prev) => {
      const current = prev[name] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  // Photo handlers
  const handleMainPhotoChange = (photo) => {
    setFormData((prev) => ({ ...prev, mainPhoto: photo }));
    if (errors.mainPhoto) {
      setErrors((prev) => ({ ...prev, mainPhoto: null }));
    }
  };

  const handleAdditionalPhotosChange = (photo, action = "add") => {
    if (action === "add") {
      setFormData((prev) => ({ ...prev, additionalPhotos: [...prev.additionalPhotos, photo] }));
    } else if (action === "delete") {
      setFormData((prev) => ({ ...prev, additionalPhotos: prev.additionalPhotos.filter((p) => p.publicId !== photo.publicId) }));
    }
  };

  const handleDeletePhoto = async (publicId) => {
    try {
      const response = await fetch("/api/deleteImage", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      const data = await response.json();

      if (data.result.result === "ok") {
        return true;
      } else {
        throw new Error(data.result.result);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to delete image");
      return false;
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.type) newErrors.type = "Please select sell or rent";
      if (!formData.name.trim()) newErrors.name = "Title is required";
      if (!formData.name.trim().length > 100) newErrors.name = "Title must be less than 50 characters";
      if (!formData.description.trim()) newErrors.description = "Description is required";
      if (!formData.description.trim().length > 500) newErrors.description = "Description must be less than 500 characters";
      if (formData.plotNumber &&!formData.plotNumber.length > 10) newErrors.plotNumber = "Plot number must be less than 10 characters";
      if (!formData.streetAddress.trim()) newErrors.streetAddress = "Street address is required";
      if (!formData.streetAddress.length > 100) newErrors.streetAddress = "Street address must be less than 100 characters";
      if (formData.region &&!formData.region.length > 50) newErrors.region = "Region must be less than 50 characters";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.city.length > 20) newErrors.city = "City must be less than 20 characters";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.state.length > 20) newErrors.state = "State must be less than 20 characters";
      if (!formData.country.trim()) newErrors.country = "Country is required";
      if (!formData.country.length > 20) newErrors.country = "Country must be less than 20 characters";
      if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";
      if (!formData.postalCode.length > 10) newErrors.postalCode = "Postal code must be less than 10 characters";
      if (formData.latitude && !formData.latitude.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/)) newErrors.latitude = "Invalid latitude";
      if (formData.longitude && !formData.longitude.match(/^[-+]?((1[0-7]\d|[1-9]?\d)(\.\d+)?|180(\.0+)?)$/)) newErrors.longitude = "Invalid longitude";
    }

    if (step === 1) {
      const currentYear = new Date().getFullYear();

      if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Valid price is required";
      if (formData.price && Number(formData.price) > (formData.type === "rent" ? 1000000 : 2500000000)) newErrors.price = "Price must be less than " + (formData.type === "rent" ? "1,000,000" : "2,500,000,000");
      if (formData.securityDeposit && Number(formData.securityDeposit) > Number(formData.price) * 0.5) newErrors.securityDeposit = "Security deposit must be less than " + (formData.price ? Number(formData.price) * 0.5 : 0);
      if (formData.tax && Number(formData.tax) > 100) newErrors.tax = "Tax must be less than 100%";
      if (formData.maintenanceFee && Number(formData.maintenanceFee) > Number(formData.price) * 0.2) newErrors.maintenanceFee = "Maintenance fee must be less than " + (formData.price ? Number(formData.price) * 0.2 : 0);
      if (!formData.yearBuilt) newErrors.yearBuilt = "Year built is required";
      if (formData.yearBuilt && (Number(formData.yearBuilt) < 1800 || Number(formData.yearBuilt) > currentYear)) newErrors.yearBuilt = `Year must be between 1800 and ${currentYear}`;
    }

    if (step === 2) {
      if (formData.livingArea && Number(formData.livingArea) > 500000) newErrors.livingArea = "Living area must be less than 500,000";
      if (!formData.bedrooms || Number(formData.bedrooms) < 0) newErrors.bedrooms = "Bedrooms is required";
      if (formData.bedrooms && Number(formData.bedrooms) > 200) newErrors.bedrooms = "Bedrooms must be less than 200";
      if (!formData.bathrooms || Number(formData.bathrooms) < 0) newErrors.bathrooms = "Bathrooms is required";
      if (formData.bathrooms && Number(formData.bathrooms) > 250) newErrors.bathrooms = "Bathrooms must be less than 250";
      if (formData.otherRooms && formData.otherRooms.length > 200) newErrors.otherRooms = "Other rooms must be less than 200 characters";
      if (formData.stories && Number(formData.stories) > 100) newErrors.stories = "Stories must be less than 100";
      if (formData.ceilingHeight && Number(formData.ceilingHeight) > 100) newErrors.ceilingHeight = "Ceiling height must be less than 100 ft";
      if (formData.floorNumber && Number(formData.floorNumber) > 150) newErrors.floorNumber = "Floor number must be less than 150";
      if (formData.plumbing && formData.plumbing.length > 175) newErrors.plumbing = "Plumbing must be less than 175 characters";
      if (formData.electrical && formData.electrical.length > 175) newErrors.electrical = "Electrical must be less than 175 characters";
      if (formData.waterSource && formData.waterSource.length > 175) newErrors.waterSource = "Water source must be less than 175 characters";
      if (formData.accessibilityFeatures && formData.accessibilityFeatures.length > 175) newErrors.accessibilityFeatures = "Accessibility features must be less than 175 characters";
      if (formData.view && formData.view.length > 175) newErrors.view = "View must be less than 175 characters";
      if (formData.privacy && formData.privacy.length > 175) newErrors.privacy = "Privacy must be less than 175 characters";
      if (formData.buildingRules && formData.buildingRules.length > 300) newErrors.buildingRules = "Building rules must be less than 300 characters";
    }

    if (step === 3) {
      if (!formData.mainPhoto) newErrors.mainPhoto = "Main photo is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      steps.current =steps.current.map((s, index) => {
        if (index === step) {
          return { ...s, completed: true };
        } else {
          return s;
        }
      });
      return true;
    } else {
      return false;
    }
  };

  // Navigation
  const goToStep = (step) => {
    if (step !== currentStep) {
      setCurrentStep(step);
    }
  };

  // Check if geocoding is needed (address or coords changed since last call)
  const isGeocodingNeeded = useCallback(() => {
    const currentAddressKey = buildAddressString(formData);
    const currentCoordsKey = `${formData.latitude || ''}|${formData.longitude || ''}`;
    const currentKey = `${currentAddressKey}::${currentCoordsKey}`;
    
    if (lastGeocodedAddress.current === currentKey) {
      return false; // Nothing changed, skip API call
    }
    return true;
  }, [formData]);

  const nextStep = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Please fill fields correctly");
      return;
    }

    if (currentStep === 0) {
      // Check if we need to make geocoding API call
      if (isGeocodingNeeded()) {
        setGeocodingLoading(true);
        try {
          const geoResult = await handleGeolocation(formData, { maxDistance: 3 });
          
          // Auto-fill coordinates if they were geocoded
          if (geoResult.source === "geocoded") {
            setFormData((prev) => ({
              ...prev,
              latitude: geoResult.lat.toString(),
              longitude: geoResult.lng.toString(),
            }));
            toast.success("📍 Location coordinates added!");
            
            // Cache the address with new coordinates
            const newCoordsKey = `${geoResult.lat}|${geoResult.lng}`;
            lastGeocodedAddress.current = `${buildAddressString(formData)}::${newCoordsKey}`;
          } else if (geoResult.verified) {
            toast.success("✓ Coordinates verified successfully!");
            // Cache the verified address and coordinates
            const currentCoordsKey = `${formData.latitude}|${formData.longitude}`;
            lastGeocodedAddress.current = `${buildAddressString(formData)}::${currentCoordsKey}`;
          }
        } catch (error) {
          setGeocodingLoading(false);
          toast.error(error.message);
          setErrors((prev) => ({
            ...prev,
            latitude: error.message.includes("Coordinates are") ? error.message : null,
            longitude: error.message.includes("Coordinates are") ? "Please verify" : null,
          }));
          return;
        }
        setGeocodingLoading(false);
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Build the listing data
      const listingData = {
        // Basic info
        type: formData.type,
        name: formData.name,
        description: formData.description,
        propertyType: formData.propertyType,

        // Address
        address: {
          plotNumber: formData.plotNumber,
          street: formData.streetAddress,
          region: formData.region,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
        },

        // Geolocation
        geolocation: {
          lat: formData.latitude ? parseFloat(formData.latitude) : 0,
          lng: formData.longitude ? parseFloat(formData.longitude) : 0,
        },

        // Pricing
        price: Number(formData.price),
        currency: formData.currency,
        priceType: formData.priceType,
        securityDeposit: formData.securityDeposit ? Number(formData.securityDeposit) : null,
        tax: formData.tax ? Number(formData.tax) : null,
        maintenanceFee: formData.maintenanceFee ? Number(formData.maintenanceFee) : null,
        leaseTerm: formData.leaseTerm,
        yearBuilt: Number(formData.yearBuilt),

        // Size
        livingArea: formData.livingArea ? Number(formData.livingArea) : null,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        otherRooms: formData.otherRooms,
        stories: formData.stories ? Number(formData.stories) : null,
        ceilingHeight: formData.ceilingHeight,
        floorNumber: formData.floorNumber ? Number(formData.floorNumber) : null,

        // Features
        parking: formData.parking,
        furnished: formData.furnished,
        flooring: formData.flooring,
        kitchenFeatures: formData.kitchenFeatures,
        cooling: formData.cooling,
        accessibilityFeatures: formData.accessibilityFeatures,
        plumbing: formData.plumbing,
        electrical: formData.electrical,
        waterSource: formData.waterSource,
        yardGarden: formData.yardGarden,
        view: formData.view,
        gym: formData.gym,
        pool: formData.pool,
        privacy: formData.privacy,
        buildingRules: formData.buildingRules,

        // Photos
        mainPhoto: formData.mainPhoto,
        additionalPhotos: formData.additionalPhotos,

        // Meta
        timestamp: serverTimestamp(),
        userRef: auth.currentUser.uid,
      };

      const docRef = await addDoc(collection(db, "listings"), listingData);
      
      // Clear draft on successful submission
      localStorage.removeItem(STORAGE_KEY);
      
      toast.success("Listing created successfully!");
      navigate(`/category/${listingData.type}/${docRef.id}`);
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8 animate-fade-in-up">
      <section>
        <h3 className="section-title flex items-center gap-2">
          <PiHouseSimpleBold className="w-5 h-5" />
          Basic Information
        </h3>
        <p className="section-subtitle mb-6">Tell us about your property</p>

        <div className="space-y-6">
          <ToggleGroup
            label="Listing Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            variant="segmented"
            required
            options={[
              { value: "sell", label: "For Sale" },
              { value: "rent", label: "For Rent" },
            ]}
            error={errors.type}
          />

          <FormField
            label="Listing Title"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Spacious 3BR Apartment with City View"
            required
            error={errors.name}
            helper="Create an attractive title that highlights key features"
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your property in detail..."
            required
            error={errors.description}
            rows={5}
          />

          <ToggleGroup
            label="Property Type"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            variant="cards"
            columns={2}
            options={PROPERTY_TYPES}
          />
        </div>
      </section>

      <div className="divider" />

      <section>
        <h3 className="section-title flex items-center gap-2">
          <FiMapPin className="w-5 h-5" />
          Address
        </h3>
        <p className="section-subtitle mb-6">Where is your property located?</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Plot / Apt Number"
              name="plotNumber"
              value={formData.plotNumber}
              onChange={handleChange}
              error={errors.plotNumber}
              placeholder="e.g., 12A"
            />
            <FormField
              label="Street Address"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              error={errors.streetAddress}
              placeholder="e.g., 123 Main Street"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Region / Locality"
              name="region"
              value={formData.region}
              onChange={handleChange}
              error={errors.region}
              placeholder="e.g., Downtown"
            />
            <FormField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., New York"
              required
              error={errors.city}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g., NY"
              required
              error={errors.state}
            />
            <FormField
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g., USA"
              required
              error={errors.country}
            />
            <FormField
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="e.g., 10001"
              required
              error={errors.postalCode}
            />
          </div>
        </div>
      </section>

      <div className="divider" />

      <section>
        <h3 className="section-title flex items-center gap-2">
          <FiMap className="w-5 h-5" />
          Coordinates
        </h3>
        <p className="section-subtitle mb-4">Precise location for map display</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">💡 Tip:</span> Leave these fields empty to auto-detect coordinates from your address. 
            If you enter coordinates manually, they'll be verified against the address (up to 3km tolerance).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Latitude"
            name="latitude"
            type="number"
            value={formData.latitude}
            onChange={handleChange}
            error={errors.latitude}
            placeholder="e.g., 40.7128"
            step="0.0001"
            min="-90"
            max="90"
            helper="Range: -90 to 90"
          />
          <FormField
            label="Longitude"
            name="longitude"
            type="number"
            value={formData.longitude}
            onChange={handleChange}
            error={errors.longitude}
            placeholder="e.g., -74.0060"
            step="0.0001"
            min="-180"
            max="180"
            helper="Range: -180 to 180"
          />
        </div>
      </section>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-fade-in-up">
      <section>
        <h3 className="section-title flex items-center gap-2">
          <FiDollarSign className="w-5 h-5" />
          Pricing
        </h3>
        <p className="section-subtitle mb-6">Set your asking price</p>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={formData.type === "rent" ? "Monthly Rent" : "Sale Price"}
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              required
              error={errors.price}
              min="0"
              max={formData.type === "rent" ? "1000000" : "2500000000"}
            />
            <FormField
              label="Currency"
              name="currency"
              type="select"
              value={formData.currency}
              onChange={handleChange}
              options={CURRENCIES}
              required
            />
          </div>

          <ToggleGroup
            label="Price Type"
            name="priceType"
            value={formData.priceType}
            onChange={handleChange}
            variant="segmented"
            required
            options={PRICE_TYPE_OPTIONS}
          />
        </div>
      </section>

      <div className="divider" />

      <section>
        <h3 className="section-title flex items-center gap-2">
          <PiNewspaper className="w-5 h-5" />
          Transaction Terms
        </h3>
        <p className="section-subtitle mb-6">Additional costs and conditions</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Security Deposit"
              name="securityDeposit"
              type="number"
              value={formData.securityDeposit}
              onChange={handleChange}
              error={errors.securityDeposit}
              placeholder="0"
              min="0"
              max={formData.price ? Number(formData.price) * 0.5 : 0}
            />
            <FormField
              label="Tax (%)"
              name="tax"
              type="number"
              value={formData.tax}
              onChange={handleChange}
              error={errors.tax}
              placeholder="0"
              min="0"
              max="100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Maintenance Fee"
              name="maintenanceFee"
              type="number"
              value={formData.maintenanceFee}
              onChange={handleChange}
              error={errors.maintenanceFee}
              placeholder="0"
              min="0"
              max={formData.price ? Number(formData.price) * 0.2 : 0}
            />
            <FormField
              label="Lease Term"
              name="leaseTerm"
              type="select"
              value={formData.leaseTerm}
              onChange={handleChange}
              placeholder="Select lease term"
              options={LEASE_TERM_OPTIONS}
            />
          </div>
        </div>
      </section>

      <div className="divider" />

      <section>
        <h3 className="section-title flex items-center gap-2">
          <LiaHouseDamageSolid className="w-5 h-5" />
          Property Age
        </h3>
        <p className="section-subtitle mb-6">When was the property constructed?</p>

        <FormField
          label="Year Built"
          name="yearBuilt"
          type="number"
          value={formData.yearBuilt}
          onChange={handleChange}
          placeholder={`e.g., ${new Date().getFullYear() - 10}`}
          required
          error={errors.yearBuilt}
          min="1800"
          max={new Date().getFullYear()}
          className="max-w-xs"
        />
      </section>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-fade-in-up">
      <section>
        <h3 className="section-title flex items-center gap-2">
          <FiGrid className="w-5 h-5" />
          Size & Layout
        </h3>
        <p className="section-subtitle mb-6">Property dimensions and rooms</p>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="Living Area (sq ft)"
              name="livingArea"
              type="number"
              value={formData.livingArea}
              onChange={handleChange}
              placeholder="0"
              min="0"
              max="500000"
              error={errors.livingArea}
            />
            <FormField
              label="Bedrooms"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleChange}
              required
              error={errors.bedrooms}
              min="0"
              max="200"
            />
            <FormField
              label="Bathrooms"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={handleChange}
              required
              error={errors.bathrooms}
              min="0"
              max="250"
            />
          </div>

          <FormField
            label="Other Rooms"
            name="otherRooms"
            value={formData.otherRooms}
            onChange={handleChange}
            error={errors.otherRooms}
            placeholder="e.g., Den, Office, Utility room"
            helper="List additional rooms separated by commas"
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="Stories / Floors"
              name="stories"
              type="number"
              value={formData.stories}
              onChange={handleChange}
              error={errors.stories}
              placeholder="1"
              min="1"
              max="100"
            />
            <FormField
              label="Ceiling Height (ft)"
              name="ceilingHeight"
              value={formData.ceilingHeight}
              onChange={handleChange}
              error={errors.ceilingHeight}
              placeholder="e.g., 9 ft"
            />
            <FormField
              label="Floor Number"
              name="floorNumber"
              type="number"
              value={formData.floorNumber}
              onChange={handleChange}
              error={errors.floorNumber}
              placeholder="e.g., 5"
              helper="For apartments"
            />
          </div>
        </div>
      </section>

      <div className="divider" />

      <section>
        <h3 className="section-title flex items-center gap-2">
          <LuSettings2 className="w-5 h-5" />
          Property Features
        </h3>
        <p className="section-subtitle mb-6">Key amenities buyers look for</p>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <ToggleGroup
              label="Parking"
              name="parking"
              value={formData.parking}
              onChange={handleChange}
              variant="pills"
              required
              options={BOOLEAN_OPTIONS}
            />

            <ToggleGroup
              label="Furnished"
              name="furnished"
              value={formData.furnished}
              onChange={handleChange}
              variant="pills"
              required
              options={BOOLEAN_OPTIONS}
            />
          </div>

          <div>
            <label className="form-label">Flooring Types</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FLOORING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiSelect("flooring", option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${formData.flooring.includes(option.value)
                    ? "bg-ink text-white"
                    : "bg-surface-100 text-ink-muted hover:bg-surface-200"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Kitchen Features</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {KITCHEN_FEATURES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleMultiSelect("kitchenFeatures", option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${formData.kitchenFeatures.includes(option.value)
                    ? "bg-ink text-white"
                    : "bg-surface-100 text-ink-muted hover:bg-surface-200"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <FormField
            label="Cooling"
            name="cooling"
            type="select"
            value={formData.cooling}
            onChange={handleChange}
            placeholder="Select cooling type"
            options={COOLING_OPTIONS}
          />
        </div>
      </section>

      <div className="divider" />

      <section>
        <h3 className="section-title flex items-center gap-2">
          <FiZap className="w-5 h-5" />
          Utilities & Infrastructure
        </h3>
        <p className="section-subtitle mb-6">Property systems and connections</p>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Plumbing"
            name="plumbing"
            value={formData.plumbing}
            onChange={handleChange}
            error={errors.plumbing}
            placeholder="e.g., Copper pipes, updated 2020"
          />
          <FormField
            label="Electrical"
            name="electrical"
            value={formData.electrical}
            onChange={handleChange}
            error={errors.electrical}
            placeholder="e.g., 200 amp service"
          />
          <FormField
            label="Water Source"
            name="waterSource"
            value={formData.waterSource}
            onChange={handleChange}
            error={errors.waterSource}
            placeholder="e.g., Municipal, Well"
          />
          <FormField
            label="Accessibility Features"
            name="accessibilityFeatures"
            value={formData.accessibilityFeatures}
            onChange={handleChange}
            error={errors.accessibilityFeatures}
            placeholder="e.g., Wheelchair ramp, wide doors"
              />
            </div>
      </section>

      <div className="divider" />

      <section>
        <h3 className="section-title flex items-center gap-2">
          <FiSun className="w-5 h-5" />
          Outdoor & Amenities
        </h3>
        <p className="section-subtitle mb-6">Additional property features</p>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <ToggleGroup
              label="Yard / Garden"
              name="yardGarden"
              value={formData.yardGarden}
              onChange={handleChange}
              variant="pills"
              options={BOOLEAN_OPTIONS}
            />
            <ToggleGroup
              label="Gym"
              name="gym"
              value={formData.gym}
              onChange={handleChange}
              variant="pills"
              options={BOOLEAN_OPTIONS}
            />
            <ToggleGroup
              label="Pool"
              name="pool"
              value={formData.pool}
              onChange={handleChange}
              variant="pills"
              options={BOOLEAN_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="View"
              name="view"
              value={formData.view}
              onChange={handleChange}
              error={errors.view}
              placeholder="e.g., Ocean, Mountain, City"
            />
            <FormField
              label="Privacy"
              name="privacy"
              value={formData.privacy}
              onChange={handleChange}
              error={errors.privacy}
              placeholder="e.g., Fenced, Gated community"
            />
          </div>
        </div>
      </section>

      <div className="divider" />

      <section>
        <h3 className="section-title flex items-center gap-2">
          <FiShield className="w-5 h-5" />
          Building Rules
        </h3>
        <p className="section-subtitle mb-6">Community guidelines and restrictions</p>

        <FormField
          label="Rules & Restrictions"
          name="buildingRules"
          type="textarea"
          value={formData.buildingRules}
          onChange={handleChange}
          error={errors.buildingRules}
          placeholder="e.g., No pets over 25 lbs, Quiet hours 10PM-8AM, No smoking on balconies..."
          rows={4}
        />
      </section>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8 animate-fade-in-up">
      <section>
        <h3 className="section-title flex items-center gap-2">
          <FiCamera className="w-5 h-5" />
          Property Photos
        </h3>
        <p className="section-subtitle mb-6">
          High-quality photos help your listing stand out
        </p>

        <PhotoUploader
          mainPhoto={formData.mainPhoto}
          additionalPhotos={formData.additionalPhotos}
          onMainPhotoChange={handleMainPhotoChange}
          onAdditionalPhotosChange={handleAdditionalPhotosChange}
          onDeletePhoto={handleDeletePhoto}
          maxAdditionalPhotos={5}
          error={errors.mainPhoto}
        />
      </section>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        //Basic Info & Location
        return renderStep1();
      case 1:
        //Pricing & Terms
        return renderStep2();
      case 2:
        //Details & Features
        return renderStep3();
      case 3:
        //Photos
        return renderStep4();
      default:
        return null;
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <main className="min-h-screen bg-surface-50">

      {showDraftPrompt && (
        <DraftRecoveryModal
          onRestore={restoreDraft}
          onDiscard={discardDraft}
        />
      )}

      <div className="flex">
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-white border-r border-surface-200 fixed top-[48px] left-0 h-[calc(100vh-48px)] z-30">
          <div className="p-6 border-b border-surface-200">
            <h1 className="text-xl font-bold text-ink">Create Listing</h1>
            <p className="text-sm text-ink-muted mt-1">
              Fill in the details to list your property
            </p>
          </div>

          <div className="p-4">
            <StepIndicator
              steps={steps.current}
              currentStep={currentStep}
              onStepClick={goToStep}
              variant="vertical"
              progress={progress}
            />
          </div>

          <div className="p-4 border-t border-surface-200 mt-auto">
            <div className="bg-surface-50 rounded-xl p-4">
              <p className="text-xs text-ink-muted">
                Need help? Check our{" "}
                <a href="#" className="text-ink font-medium hover:underline">
                  listing guide
                </a>{" "}
                for tips on creating an effective listing.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Header - Steps (shown on small screens, positioned below navbar) */}
        <div className="lg:hidden fixed top-[48px] left-0 right-0 bg-white border-b border-surface-200 z-40 px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-ink">Create Listing</h1>
            <span className={`text-sm font-semibold ${progress.percentage >= 80 ? 'text-success' : 'text-warning'}`}>
              {Math.round(progress.percentage)}%
            </span>
          </div>
          <div className="relative">
            <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progress.percentage >= 80 ? 'bg-success' : 'bg-warning'
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div 
              className="absolute top-0 w-0.5 h-2 bg-ink/30"
              style={{ left: '80%' }}
            />
          </div>
          <p className={`text-2xs mt-1.5 ${progress.percentage >= 80 ? 'text-success' : 'text-warning'}`}>
            {progress.percentage < 80 
              ? `Required: ${progress.requiredPercentage}% complete`
              : progress.percentage < 100
                ? 'Ready to submit!'
                : 'All fields complete!'
            }
          </p>
        </div>

        {/* Main Content - offset for fixed sidebar on desktop */}
        <div className="flex-1 lg:ml-72 xl:ml-80">
          <div className="max-w-3xl mx-auto px-4 py-8 lg:py-10 mt-24 lg:mt-0 pb-32 lg:pb-10">
            <form onSubmit={handleSubmit}>
              <div className="card-elevated">{renderStepContent()}</div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`btn-secondary ${
                    currentStep === 0 ? "opacity-0 pointer-events-none" : ""
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                {currentStep < STEPS.length - 1 ? (
                  <button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={geocodingLoading}
                    className={`btn-primary ${geocodingLoading ? 'opacity-75 cursor-wait' : ''}`}
                  >
                    {geocodingLoading ? (
                      <>
                        <FiLoader className="w-5 h-5 animate-spin" />
                        Verifying Location...
                      </>
                    ) : (
                      <>
                        Next
                        <FiChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="relative group">
                    <button 
                      type="submit" 
                      disabled={!progress.canSubmit}
                      className={`btn-primary ${!progress.canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FiCheck className="w-5 h-5" />
                      Create Listing
                    </button>
                    {!progress.canSubmit && (
                      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-ink text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Complete all required fields first
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateListing;
