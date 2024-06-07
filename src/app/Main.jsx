import React, { useState } from "react";
import MonitorControl from "./MonitorControl";
import CopyDataComponent from "./CopyDataComponent";

import { FiMonitor } from "react-icons/fi";
import { FaRegCopy } from "react-icons/fa";

function Main() {
  const [currentComponent, setCurrentComponent] = useState(null);
  const [isVisitorView, setIsVisitorView] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Define errorMessage state

  const handleButtonClick = (componentName) => {
    if (authenticated) {
      setCurrentComponent(componentName);
    }
  };

  const handleBackButtonClick = () => {
    setCurrentComponent(null);
    setIsVisitorView(false);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePasswordSubmit = () => {
    if (password === "dvbsadmin") {
      setAuthenticated(true);
    } else {
      setErrorMessage("Incorrect password. Please try again.");
    }
  };

  const renderPasswordForm = () => {
    if (!authenticated) {
      return (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={handlePasswordChange}
              className="px-4 py-2 border border-gray-300 rounded-md mr-2"
            />
            <button
              onClick={handlePasswordSubmit}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 hover:bg-blue-600"
            >
              Submit
            </button>
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCurrentComponent = () => {
    switch (currentComponent) {
      case "MonitorControl":
        return <MonitorControl />;
      case "CopyDataComponent":
        return <CopyDataComponent />;
      default:
        return (
          <div
            className="flex flex-col justify-center items-center h-screen"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.05))",
              position: "relative",
            }}
          >
            <div className="text-white text-center mb-10 relative">
              <h1 className="font-bold text-9xl">DVBS</h1>
              <h2 className="text-2xl font-thin">2024</h2>
              <h3 className="text-3xl font-semibold">Admin Panel</h3>
            </div>
            <div className="container mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                <button
                  className={`focus:outline-none bg-white/5 backdrop-blur-5xl text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 ${
                    authenticated ? "" : "cursor-not-allowed opacity-50"
                  }`}
                  onClick={() => handleButtonClick("MonitorControl")}
                  style={{ animation: "slide-from-left 1s ease forwards" }}
                  disabled={!authenticated}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <FiMonitor style={{ fontSize: "3.5em" }} />
                    <span style={{ marginTop: "0.5em" }}>
                      Monitor Control
                    </span>
                  </div>
                </button>
                <button
                  className={`focus:outline-none bg-white/5 backdrop-blur-5xl text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 ${
                    authenticated ? "" : "cursor-not-allowed opacity-50"
                  }`}
                  onClick={() => handleButtonClick("CopyDataComponent")}
                  style={{ animation: "slide-from-left 1s ease forwards" }}
                  disabled={!authenticated}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <FaRegCopy style={{ fontSize: "3.5em" }} />
                    <span style={{ marginTop: "0.5em" }}>Copy Database</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  // Style the back button with modern UI
  const backButton = currentComponent ? (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2"
        onClick={handleBackButtonClick}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ transform: "rotate(270deg)" }}
        >
          <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  ) : null;

  const currentYear = new Date().getFullYear();

  return (
    <div className="fade-in">
      <div className="fade-in">
        <div>
          {renderPasswordForm()}
          {backButton}
          {renderCurrentComponent()}
        </div>
      </div>
    </div>
  );
}

export default Main;
