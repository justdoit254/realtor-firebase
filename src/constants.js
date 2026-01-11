import { FiCamera, FiDollarSign, FiGrid, FiHome } from "react-icons/fi";

export const STORAGE_KEY = "listingDraft";

export const INITIAL_FORM_DATA = {
  // Basic
  type: "rent",
  name: "",
  description: "",
  propertyType: "",
  
  // Address
  plotNumber: "",
  streetAddress: "",
  region: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  
  // Coordinates
  latitude: "",
  longitude: "",
  
  // Pricing
  price: "",
  currency: "USD",
  priceType: "fixed",
  securityDeposit: "",
  tax: "",
  maintenanceFee: "",
  leaseTerm: "",
  
  // Year
  yearBuilt: "",
  
  // Size
  livingArea: "",
  bedrooms: 1,
  bathrooms: 1,
  otherRooms: "",
  stories: "",
  ceilingHeight: "",
  floorNumber: "",
  
  // Features
  parking: false,
  furnished: false,
  flooring: [],
  kitchenFeatures: [],
  cooling: "",
  accessibilityFeatures: "",
  plumbing: "",
  electrical: "",
  waterSource: "",
  yardGarden: false,
  view: "",
  gym: false,
  pool: false,
  privacy: "",
  
  // Building rules
  buildingRules: "",
  
  // Photos
  mainPhoto: null,
  additionalPhotos: [],
}

// Required fields = 80% weight, Optional fields = 20% weight
export const REQUIRED_FIELDS = [
  { key: 'type', validate: (v) => v && v.trim() !== '' },
  { key: 'name', validate: (v) => v && v.trim().length >= 3 && v.trim().length <= 100 },
  { key: 'description', validate: (v) => v && v.trim().length >= 10 && v.trim().length <= 500 },
  { key: 'streetAddress', validate: (v) => v && v.trim().length >= 3 && v.trim().length <= 100 },
  { key: 'city', validate: (v) => v && v.trim().length >= 2 && v.trim().length <= 20 },
  { key: 'state', validate: (v) => v && v.trim().length >= 2 && v.trim().length <= 20 },
  { key: 'country', validate: (v) => v && v.trim().length >= 2 && v.trim().length <= 20 },
  { key: 'postalCode', validate: (v) => v && v.trim().length >= 3 && v.trim().length <= 10 },
  { key: 'price', validate: (v) => v && Number(v) > 0 },
  { key: 'currency', validate: (v) => v && v.trim() !== '' },
  { key: 'priceType', validate: (v) => v && v.trim() !== '' },
  { key: 'yearBuilt', validate: (v) => {
    const year = Number(v);
    const currentYear = new Date().getFullYear();
    return year >= 1800 && year <= currentYear;
  }},
  { key: 'bedrooms', validate: (v) => v !== '' && Number(v) >= 0 && Number(v) <= 200 },
  { key: 'bathrooms', validate: (v) => v !== '' && Number(v) >= 0 && Number(v) <= 250 },
  { key: 'parking', validate: () => true },
  { key: 'furnished', validate: () => true },
  { key: 'mainPhoto', validate: (v) => v && v.publicId },
];

export const OPTIONAL_FIELDS = [
  { key: 'propertyType', validate: (v) => v && v.trim() !== '' },
  { key: 'plotNumber', validate: (v) => v && v.trim().length > 0 && v.trim().length <= 10 },
  { key: 'region', validate: (v) => v && v.trim().length > 0 && v.trim().length <= 50 },
  { key: 'latitude', validate: (v) => v && /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/.test(v) },
  { key: 'longitude', validate: (v) => v && /^[-+]?((1[0-7]\d|[1-9]?\d)(\.\d+)?|180(\.0+)?)$/.test(v) },
  { key: 'securityDeposit', validate: (v) => v && Number(v) > 0 },
  { key: 'tax', validate: (v) => v && Number(v) >= 0 && Number(v) <= 100 },
  { key: 'maintenanceFee', validate: (v) => v && Number(v) > 0 },
  { key: 'leaseTerm', validate: (v) => v && v.trim() !== '' },
  { key: 'livingArea', validate: (v) => v && Number(v) > 0 && Number(v) <= 500000 },
  { key: 'otherRooms', validate: (v) => v && v.trim().length > 0 && v.trim().length <= 200 },
  { key: 'stories', validate: (v) => v && Number(v) > 0 && Number(v) <= 100 },
  { key: 'ceilingHeight', validate: (v) => v && v.trim().length > 0 },
  { key: 'floorNumber', validate: (v) => v && Number(v) >= 0 && Number(v) <= 150 },
  { key: 'flooring', validate: (v) => Array.isArray(v) && v.length > 0 },
  { key: 'kitchenFeatures', validate: (v) => Array.isArray(v) && v.length > 0 },
  { key: 'cooling', validate: (v) => v && v.trim() !== '' },
  { key: 'plumbing', validate: (v) => v && v.trim().length > 0 && v.trim().length <= 175 },
  { key: 'electrical', validate: (v) => v && v.trim().length > 0 && v.trim().length <= 175 },
  { key: 'waterSource', validate: (v) => v && v.trim().length > 0 && v.trim().length <= 175 },
  { key: 'accessibilityFeatures', validate: (v) => v && v.trim().length > 0 && v.trim().length <= 175 },
  { key: 'yardGarden', validate: () => true },
  { key: 'gym', validate: () => true },
  { key: 'pool', validate: () => true },
  { key: 'view', validate: (v) => v && v.trim().length > 0 && v.trim().length <= 175 },
  { key: 'privacy', validate: (v) => v && v.trim().length > 0 && v.trim().length <= 175 },
  { key: 'buildingRules', validate: (v) => v && v.trim().length > 0 && v.trim().length <= 300 },
  { key: 'additionalPhotos', validate: (v) => Array.isArray(v) && v.length > 0 },
];

// Step configuration
export const STEPS = [
  { id: "property", title: "Property", subtitle: "Basic info & location", icon: FiHome },
  { id: "pricing", title: "Pricing", subtitle: "Price & terms", icon: FiDollarSign },
  { id: "details", title: "Details", subtitle: "Size & features", icon: FiGrid },
  { id: "photos", title: "Photos", subtitle: "Upload images", icon: FiCamera },
];

// Property type options
export const PROPERTY_TYPES = [
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "ranch", label: "Ranch" },
  { value: "studio", label: "Studio" },
  { value: "single-family", label: "Single Family" },
  { value: "multi-family", label: "Multi-Family" },
  { value: "apartment", label: "Apartment" },
  { value: "commercial", label: "Commercial" },
];

// Currency options
export const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "INR", label: "INR (₹)" },
];

// Price type options
export const PRICE_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed Price" },
  { value: "negotiable", label: "Negotiable" },
];

//Lease term options
export const LEASE_TERM_OPTIONS = [
  { value: "month-to-month", label: "Month to Month" },
  { value: "6-months", label: "6 Months" },
  { value: "1-year", label: "1 Year" },
  { value: "2-years", label: "2 Years" },
  { value: "flexible", label: "Flexible" },
  { value: "none", label: "None" },
]

// Feature options for multi-select
export const FLOORING_OPTIONS = [
  { value: "hardwood", label: "Hardwood" },
  { value: "tile", label: "Tile" },
  { value: "carpet", label: "Carpet" },
  { value: "laminate", label: "Laminate" },
  { value: "vinyl", label: "Vinyl" },
  { value: "concrete", label: "Concrete" },
  { value: "marble", label: "Marble" },
];

export const KITCHEN_FEATURES = [
  { value: "island", label: "Kitchen Island" },
  { value: "granite", label: "Granite Counters" },
  { value: "stainless", label: "Stainless Appliances" },
  { value: "pantry", label: "Walk-in Pantry" },
  { value: "gas-stove", label: "Gas Stove" },
  { value: "dishwasher", label: "Dishwasher" },
];

export const COOLING_OPTIONS = [
  { value: "central-ac", label: "Central AC" },
  { value: "split-ac", label: "Split AC" },
  { value: "window-ac", label: "Window AC" },
  { value: "ceiling-fans", label: "Ceiling Fans" },
  { value: "none", label: "None" },
];

export const BOOLEAN_OPTIONS = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
]