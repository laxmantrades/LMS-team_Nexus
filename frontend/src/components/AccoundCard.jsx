import React from "react";

const AccountCard = ({ user, onEditAddress, displayAddress }) => 
  <div className="md:col-span-1 bg-gray-50 border border-gray-100 rounded-lg p-4">
    <h2 className="text-lg font-semibold mb-2 text-black">Account</h2>
    <p className="text-sm text-gray-700 mb-1">
      <strong>Email:</strong> {user?.email}
    </p>
    <p className="text-sm text-gray-700 mb-1">
      <strong>Role:</strong> {user?.role}
    </p>

    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Address</h3>
      <p className="text-sm text-gray-600 mb-3">
        {displayAddress || "No address on file."}
      </p>
      <div className="flex gap-2">
        <button
          className="px-3 py-1 bg-white border border-gray-200 text-black rounded text-sm"
          onClick={onEditAddress}
        >
          Edit
        </button>
      </div>
    </div>
  </div>


export default AccountCard;
