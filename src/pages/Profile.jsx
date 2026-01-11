import React, { useEffect, useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import { 
  FiUser, 
  FiMail, 
  FiEdit2, 
  FiCheck, 
  FiLogOut, 
  FiPlus,
  FiHome,
  FiGrid
} from "react-icons/fi";

const Profile = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const [changeDetail, setChangeDetail] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const [listings, setListings] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(false);

  const { name, email } = formData;

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const fetchUserListing = async () => {
      setListingsLoading(true);

      const listingRef = collection(db, "listings");
      const docQuery = query(
        listingRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );

      try {
        const querySnap = await getDocs(docQuery);

        let listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
      } catch (error) {
        console.log("Error", error);
      } finally {
        setListingsLoading(false);
      }
    };

    fetchUserListing();
  }, [auth.currentUser.uid]);

  const onLogOut = () => {
    auth.signOut();
    navigate("/");
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, { name });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Could not update profile details");
    }
  };

  const onDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      const docRef = doc(db, "listings", id);
      await deleteDoc(docRef);
      const updatedListings = listings.filter((each) => each.id != id);
      setListings(updatedListings);
      toast.success("Listing deleted successfully");
    }
  };

  const onEdit = (id) => {
    navigate(`/edit-listing/${id}`);
  };

  return (
    <main className="min-h-screen bg-surface-50">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-10">
        
        {/* Page Header */}
        {/* <div className="max-w-xl mx-auto mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-ink">My Profile</h1>
          <p className="text-sm text-ink-muted mt-1">Manage your account and listings</p>
        </div> */}

        {/* Profile Card */}
        <div className="max-w-xl mx-auto mb-10 animate-fade-in-up">
          <div className="card-elevated">
            {/* Profile Header - Compact with Avatar */}
            <div className="flex items-center gap-4 mb-6">
              {/* Avatar */}
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-ink text-white text-lg font-bold flex items-center justify-center shadow-soft">
                {getInitials(name)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-ink truncate">
                  {name || "Welcome"}
                </h2>
                <p className="text-sm text-ink-muted truncate">{email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  changeDetail && onSubmit();
                  setChangeDetail((prevState) => !prevState);
                }}
                className={`btn-ghost flex-shrink-0 ${changeDetail ? "text-success" : "text-ink-muted"}`}
              >
                {changeDetail ? (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Save
                  </>
                ) : (
                  <>
                    <FiEdit2 className="w-4 h-4" />
                    Edit
                  </>
                )}
              </button>
            </div>

            <div className="divider !my-4" />

            <form className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                  <input
                    type="text"
                    id="name"
                    value={name}
                    disabled={!changeDetail}
                    onChange={onChange}
                    className={`form-input-base pl-10 py-2.5 ${
                      changeDetail 
                        ? "bg-accent-subtle border-ink focus:border-ink" 
                        : "bg-surface-50 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="form-input-base pl-10 py-2.5 bg-surface-50 cursor-not-allowed"
                  />
                </div>
                <p className="form-helper">Email cannot be changed</p>
              </div>
            </form>

            <div className="divider !my-5" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/create-listing" className="flex-1">
                <button type="button" className="btn-primary w-full">
                  <FiPlus className="w-5 h-5" />
                  Create Listing
                </button>
              </Link>
              <button
                type="button"
                onClick={onLogOut}
                className="btn-secondary flex-1 sm:flex-none"
              >
                <FiLogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        {!listingsLoading && listings?.length > 0 && (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-ink flex items-center gap-2">
                  <FiHome className="w-6 h-6" />
                  My Listings
                </h2>
                <p className="text-ink-muted text-sm mt-1">
                  {listings.length} {listings.length === 1 ? "property" : "properties"} listed
                </p>
              </div>
              <Link 
                to="/create-listing"
                className="btn-ghost text-ink-muted hover:text-ink"
              >
                <FiPlus className="w-4 h-4" />
                Add New
              </Link>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                  onDelete={(id) => onDelete(id)}
                  onEdit={(id) => onEdit(id)}
                />
              ))}
            </ul>
          </section>
        )}

        {/* Empty State */}
        {!listingsLoading && listings?.length === 0 && (
          <section className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-100 text-ink-muted mb-4">
              <FiGrid className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-2">No listings yet</h3>
            <p className="text-ink-muted mb-6 max-w-sm mx-auto">
              Start by creating your first property listing to showcase it to potential buyers or renters.
            </p>
            <Link to="/create-listing">
              <button type="button" className="btn-primary">
                <FiPlus className="w-5 h-5" />
                Create Your First Listing
              </button>
            </Link>
          </section>
        )}

        {/* Loading State */}
        {listingsLoading && (
          <section className="py-16">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              <p className="text-ink-muted">Loading your listings...</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Profile;
