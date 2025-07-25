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
import { FcHome } from "react-icons/fc";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";

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
      //update display name in firebase auth
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      //update name in the firestore
      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, { name }); //Make name a compulsory field in sign-in
      // auth.currentUser.displayName
      //   ? await updateDoc(docRef, { name })
      //   : await setDoc(docRef, { name });

      toast.success("Profile details update");
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
    <>
      <section className="max-w-6xl mx-auto flex  flex-col justify-center items-center">
        <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3">
          <form>
            <input
              type="text"
              id="name"
              value={name}
              disabled={!changeDetail}
              onChange={onChange}
              className={`w-full px-4 py-2 mb-6 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out ${
                changeDetail && "bg-red-200 focus:bg-red-200"
              }`}
            />
            <input
              type="email"
              id="email"
              value={email}
              disabled
              className="w-full px-4 py-2 mb-6 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"
            />
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
              <p className="flex items-center">
                Do you want to change your name?
                <span
                  className="text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer"
                  onClick={() => {
                    changeDetail && onSubmit();
                    setChangeDetail((prevState) => !prevState);
                  }}
                >
                  {changeDetail ? "Apply change" : "Edit"}
                </span>
              </p>
              <p
                className="text-blue-600 hover:text-blue-800 transition ease-in-out duration-200 cursor-pointer"
                onClick={onLogOut}
              >
                Sign out
              </p>
            </div>
          </form>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white uppercase px-7 py-3 text-sm font-medium rounded shadow-sm hover:bg-blue-700 transition duration-200 ease-in-out hover:shadow-lg active:bg-blue-800"
          >
            <Link
              to="/create-listing"
              className="flex justify-center items-center"
            >
              <FcHome className="mr-2 text-3xl bg-red-200 rounded-full p-1 border-2" />{" "}
              Sell or rent your home
            </Link>
          </button>
        </div>
      </section>
      {!listingsLoading && listings?.length > 0 && (
        <div className="max-w-6xl px-3 my-6 mx-auto">
          <h2 className="text-2xl text-center font-semibold mb-6">
            My Listings
          </h2>
          <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
        </div>
      )}
    </>
  );
};

export default Profile;
