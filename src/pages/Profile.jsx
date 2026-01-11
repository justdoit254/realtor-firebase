import React, { useEffect, useState, useRef } from "react";
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
  FiMail, 
  FiEdit2, 
  FiCheck, 
  FiLogOut, 
  FiPlus,
  FiHome,
  FiGrid,
  FiX
} from "react-icons/fi";

const Profile = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const nameInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(auth.currentUser.displayName || "");
  const [listings, setListings] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(false);

  const name = auth.currentUser.displayName;
  const email = auth.currentUser.email;

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

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const onLogOut = () => {
    auth.signOut();
    navigate("/");
  };

  const startEditing = () => {
    setEditName(name || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditName(name || "");
    setIsEditing(false);
  };

  const onSubmit = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      if (name !== editName) {
        await updateProfile(auth.currentUser, { displayName: editName });
        const docRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(docRef, { name: editName });
        toast.success("Profile updated successfully");
      }
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Could not update profile details");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    } else if (e.key === "Escape") {
      cancelEditing();
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
            {/* Profile Display */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-ink text-white text-xl font-bold flex items-center justify-center shadow-soft">
                {getInitials(isEditing ? editName : name)}
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Name - Display or Edit Mode */}
                {isEditing ? (
                  <div className="mb-2">
                    <div className="relative">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter your name"
                        className="w-full text-md font-semibold text-ink bg-amber-50 border-2 border-amber-400 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                      />
                      <span className="absolute -top-2 left-2 px-1.5 bg-amber-50 text-xs font-medium text-amber-700">
                        Editing
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-1 ml-1">
                      Press Enter to save, Escape to cancel
                    </p>
                  </div>
                ) : (
                  <h2 className="text-xl font-semibold text-ink truncate mb-1">
                    {name || "Welcome"}
                  </h2>
                )}
                
                {/* Email - Always Display */}
                <div className="flex items-center gap-2 text-ink-muted">
                  <FiMail className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{email}</span>
                </div>
              </div>

              {/* Edit/Save/Cancel Buttons */}
              <div className="flex-shrink-0">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-100 transition-colors"
                      title="Cancel"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={onSubmit}
                      className="p-2 rounded-lg bg-ink text-white hover:bg-ink/90 transition-colors"
                      title="Save"
                    >
                      <FiCheck className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-100 transition-colors"
                    title="Edit name"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

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
