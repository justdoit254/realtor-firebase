import React from "react";
import { FcGoogle } from "react-icons/fc";

const OAuth = () => {
  return (
    <button
      type="submit"
      className="flex justify-center items-center w-full bg-red-700 text-white px-7 py-3 uppercase text-sm font-medium shadow-md hover:bg-red-800 active:bg-red-900 hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out"
    >
      <FcGoogle className="text-2xl bg-white rounded-full mr-2" /> Continue with
      Google
    </button>
  );
};

export default OAuth;
