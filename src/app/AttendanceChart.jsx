import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";
import { Menu } from "@headlessui/react";
// import { ChevronDownIcon } from "@heroicons/react/solid";

const getDefaultSelectedDay = () => {
  const today = new Date().getDay();
  return today === 0 || today === 6 ? "E" : String.fromCharCode(65 + today - 1);
};

function AttendanceChart() {
  const [attendanceData, setAttendanceData] = useState({
    primary: {},
    middlers: {},
    juniors: {},
    youth: {},
  });
  const [selectedDay, setSelectedDay] = useState(getDefaultSelectedDay());

  useEffect(() => {
    const fetchAttendanceData = async () => {
      const documents = ["primary", "middlers", "juniors", "youth"];
      const listeners = {};

      for (const docName of documents) {
        const docRef = doc(db, "dvbs", docName);
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
    const existingChart = Chart.getChart("attendanceChart");
    if (existingChart) {
      existingChart.destroy();
    }

    const datasets = Object.keys(attendanceData).map((docName, index) => {
      const data = countPresentForDay(attendanceData[docName], selectedDay);
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
        labels: [getDayLabel(selectedDay)],
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: `Attendance for ${getDayLabel(selectedDay)}`,
            font: {
              size: 18,
            },
          },
        },
        elements: {
          bar: {
            borderRadius: 10,
          },
        },
        scales: {
          x: {
            ticks: {
              display: false,
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

  const getTotalAttendanceForDay = (day) => {
    return Object.keys(attendanceData).reduce((total, group) => {
      return total + countPresentForDay(attendanceData[group], day);
    }, 0);
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
  };

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
    <div className="attendance-chart-container flex flex-col md:flex-row h-screen w-screen bg-black">
      {/* Chart Section */}
      <div className="h-full md:w-2/3">
        <div className="bg-white rounded-lg p-4 shadow-lg w-full h-full">
          <canvas id="attendanceChart" className="w-full h-full"></canvas>
        </div>
      </div>

      {/* Values Section */}
      <div className="w-full md:w-1/3 flex flex-col items-center p-4">
        <Menu as="div" className="relative inline-block text-left mb-2">
          <Menu.Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            {getDayLabel(selectedDay)}
            {/* <ChevronDownIcon className="w-5 h-5 ml-2" /> */}
          </Menu.Button>

          <Menu.Items className="absolute left-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
              (day, index) => (
                <Menu.Item key={day}>
                  {({ active }) => (
                    <button
                      onClick={() =>
                        handleDayChange(String.fromCharCode(65 + index))
                      }
                      className={`${
                        active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                      } group flex rounded-md items-center w-full px-4 py-2 text-sm`}>
                      {day}
                    </button>
                  )}
                </Menu.Item>
              )
            )}
          </Menu.Items>
        </Menu>

        {Object.keys(attendanceData).map((group, index) => (
          <div
            key={group}
            style={{ backgroundColor: ["#FFC100", "#04d924", "#027df7", "#f70233"][index] }}
            className="h-full md:h-full w-full flex flex-col items-center rounded-lg m-2 justify-center cursor-pointer">
            <div className="text-5xl md:text-8xl text-white font-bold">
              {countPresentForDay(attendanceData[group], selectedDay)}
            </div>
            <div className="md:text-4xl text-white font-bold">{group}</div>
          </div>
        ))}

        <div className="w-full flex flex-col items-center rounded-lg m-2 justify-center bg-gray-300 cursor-pointer">
          <div className="text-5xl md:text-9xl text-black font-bold">
            {getTotalAttendanceForDay(selectedDay)}
          </div>
          <div className="md:text-4xl md:mb-4 text-black font-bold">Total</div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceChart;
