import React, { useState } from "react";

const Password = ({ correctPassword, children, isVisitorView, setIsVisitorView }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isVisitorView, setIsVisitorView] = useState(false);

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

  const handleVisitorView = () => {
    setIsAuthenticated(true); // Directly set isAuthenticated to true for visitor view
    setIsVisitorView(true); // Set the state indicating visitor view
  };

  return (
    <div>
      {isAuthenticated || isVisitorView ? (
        children
      ) : (
        <div className="h-screen flex justify-center items-center ">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1>
              This is a restricted feature intended only for specific persons, enter password to edit data or view as visitor.
            </h1>
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
              <button
                onClick={handleVisitorView}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded block w-full mt-4">
                Enter as Visitor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Password;
