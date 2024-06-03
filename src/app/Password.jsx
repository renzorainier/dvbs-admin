import React, { useState } from "react";

const Password = ({ correctPassword, children }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePinChange = (event) => {
    setPin(event.target.value);
    setError(""); // Clear error message when PIN input changes
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (pin === correctPassword) {
      setIsAuthenticated(true);
    } else {
      setError("Incorrect PIN. Please try again."); // Set error message
      setPin(""); // Clear PIN input after incorrect entry
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        children
      ) : (
        <div className="h-screen flex justify-center items-center bg-gray-200">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Enter PIN</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="number"
                value={pin}
                onChange={handlePinChange}
                className="border border-gray-300 rounded px-3 py-2 mb-4 block w-full text-lg"
                placeholder="Enter PIN"
              />
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>} {/* Display error message */}
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded block w-full">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Password;
