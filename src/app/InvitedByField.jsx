import React, { useState } from "react";
import { Combobox } from "@headlessui/react";


function InvitedByField({ invitedBy, handleInputChange, config }) {
  return (
    <input
      type="text"
      value={invitedBy}
      onChange={(e) => handleInputChange(e, "invitedBy")}
      placeholder="Invited by"
      className={`border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-[${config.color}]`}
    />
  );
}

export default InvitedByField;
