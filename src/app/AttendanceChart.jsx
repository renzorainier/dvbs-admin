import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js"; // Import your Firebase config
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";

function AttendanceChart() {
  const [attendanceData, setAttendanceData] = useState({
    primary: {},
    middlers: {},
    juniors: {},
    youth: {},
  });

  // Function to get the default selected day
  const getDefaultSelectedDay = () => {
    const today = new Date().getDay();
    // If it's Saturday or Sunday, set it to Friday
    if (today === 0 || today === 6) {
      return "E"; // Friday
    }
    // Otherwise, set it to the corresponding letter for the current day
    return String.fromCharCode(65 + today - 1); // A is Monday
  };

  const [selectedDay, setSelectedDay] = useState(getDefaultSelectedDay());

  useEffect(() => {
    const fetchAttendanceData = async () => {
      const documents = ["primary", "middlers", "juniors", "youth"];

      // Initialize an object to store the listeners
      const listeners = {};

      for (const docName of documents) {
        const docRef = doc(db, "dvbs", docName);
        // Set up a listener for changes in the document
        listeners[docName] = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setAttendanceData((prevData) => ({
              ...prevData,
              [docName]: doc.data(),
            }));
          } else {
            console.error(`Document ${docName} does not exist!`);
          }
        });
      }

      // Return a cleanup function to unsubscribe from listeners
      return () => {
        Object.values(listeners).forEach((unsubscribe) => unsubscribe());
      };
    };

    fetchAttendanceData();
  }, []);

  useEffect(() => {
    if (attendanceData) {
      renderChart();
    }
  }, [attendanceData, selectedDay]);

  const renderChart = () => {
    // Check if there's an existing chart instance and destroy it
    const existingChart = Chart.getChart("attendanceChart");
    if (existingChart) {
      existingChart.destroy();
    }

    const datasets = Object.keys(attendanceData).map((docName, index) => {
      const data = countPresentForDay(attendanceData[docName], selectedDay);
      // Define colors for each dataset
      const colors = ["#FFC100", "#04d924", "#027df7", "#f70233"];
      return {
        label: docName,
        data: [data],
        backgroundColor: colors[index],
      };
    });

    const ctx = document.getElementById("attendanceChart");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: [selectedDay],
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Add this line to remove aspect ratio
        plugins: {
          legend: {
            display: true, // Show the legend
          },
          title: {
            display: true,
            text: `Attendance for ${getDayLabel(selectedDay)}`,
            font: {
              size: 18, // Increase title font size
            },
          },
        },
        elements: {
          bar: {
            borderRadius: 10, // Adjust the value as needed
          },
        },
        scales: {
          x: {
            ticks: {
              display: false, // Hide the x-axis ticks
            },
          },
        },
      },
    });
  };

  const countPresentForDay = (attendanceData, day) => {
    return Object.keys(attendanceData).filter(
      (key) => key.startsWith("0") && key.endsWith(day) && attendanceData[key]
    ).length;
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
  };

  // Function to get the day label from the selected day letter
  const getDayLabel = (day) => {
    switch (day) {
      case "A":
        return "Monday";
      case "B":
        return "Tuesday";
      case "C":
        return "Wednesday";
      case "D":
        return "Thursday";
      case "E":
        return "Friday";
      default:
        return day;
    }
  };

  return (
    <div className="attendance-chart-container bg-white h-screen w-screen flex flex-col items-center justify-center">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex justify-center w-full rounded-md bg-black/20 px-4 py-2 text-sm font-bold text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
            {getDayLabel(selectedDay)}
          </Menu.Button>
        </div>
        <Menu.Items className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
            (day, index) => (
              <Menu.Item key={day}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-gray-100" : "bg-white"
                    } group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                    onClick={() =>
                      handleDayChange(String.fromCharCode(65 + index))
                    }>
                    {day}
                  </button>
                )}
              </Menu.Item>
            )
          )}
        </Menu.Items>
      </Menu>
      <div className="w-full h-full">
        <canvas id="attendanceChart" className="w-full h-full"></canvas>
      </div>
      <div className="day-selector mt-4"></div>
    </div>
  );
}

export default AttendanceChart;
