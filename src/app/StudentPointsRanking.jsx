import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { db } from "./firebase.js";
import { db2 } from "./firebaseConfig2.js";
import { Transition } from '@headlessui/react';

const StudentRanking = () => {
  const [groupedStudents, setGroupedStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [configGroup, setConfigGroup] = useState(null);

  useEffect(() => {
    const unsubscribeStudents = onSnapshot(
      collection(db, "dvbs"),
      (querySnapshot) => {
        const studentData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const currentDayLetter = getCurrentDayLetter();
        const presentStudents = studentData
          .map((group) => {
            const groupStudents = [];
            for (const key in group) {
              if (key.endsWith(currentDayLetter)) {
                const prefix = key.slice(0, 2);
                const pointsField = `${prefix}${currentDayLetter}points`;
                if (group[pointsField]) {
                  groupStudents.push({
                    id: group.id,
                    group: group.id,
                    prefix,
                    name: group[`${prefix}name`],
                    location: group[`${prefix}loc`],
                    points: group[pointsField],
                  });
                }
              }
            }
            return groupStudents;
          })
          .flat();

        console.log("Fetched Students:", presentStudents);

        // Sort students by points from highest to lowest
        presentStudents.sort((a, b) => b.points - a.points);

        // Group students by their group (document name)
        const groups = presentStudents.reduce((acc, student) => {
          if (!acc[student.group]) {
            acc[student.group] = [];
          }
          acc[student.group].push(student);
          return acc;
        }, {});

        // Group students by their ranks within each group
        const groupedByRank = {};
        for (const group in groups) {
          let rank = 0;
          let currentRankPoints = null;
          let currentRankStudents = 0;
          let rankIndex = 0;
          groupedByRank[group] = {};
          groups[group].forEach((student) => {
            if (student.points !== currentRankPoints) {
              rank++;
              currentRankPoints = student.points;
              currentRankStudents = 0;
              rankIndex = 0;
            }
            if (currentRankStudents < 5 && rank <= 5) {
              if (!groupedByRank[group][rank]) {
                groupedByRank[group][rank] = [];
              }
              groupedByRank[group][rank].push(student);
              currentRankStudents++;
              rankIndex++;
            }
          });
        }

        setGroupedStudents(groupedByRank);
        setLoading(false);
      }
    );

    const unsubscribeConfig = onSnapshot(doc(db2, "points/config"), (doc) => {
      if (doc.exists()) {
        const configData = doc.data();
        console.log("Fetched Config Data:", configData.group);
        setConfigGroup(configData.group); // Set the fetched group name
      } else {
        console.log("Config document does not exist");
      }
    });

    return () => {
      unsubscribeStudents();
      unsubscribeConfig();
    };
  }, []);

  const getCurrentDayLetter = () => {
    const days = ["A", "B", "C", "D", "E"];
    const dayIndex = new Date().getDay();
    return days[dayIndex >= 1 && dayIndex <= 5 ? dayIndex - 1 : 4];
  };

  const getBackgroundColor = (group) => {
    switch (group) {
      case "primary":
        return "#FFC100";
      case "middlers":
        return "#04d924";
      case "juniors":
        return "#027df7";
      case "youth":
        return "#f70233";
      default:
        return "#FFFFFF";
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-[#9ca3af] min-h-screen h-screen overflow-auto">
      <div className="flex justify-center items-center h-full overflow-auto">
        <div className="w-full h-full rounded-lg mx-auto flex flex-col justify-center">
          {configGroup &&
            groupedStudents[configGroup] && ( // Check if configGroup is fetched and if the corresponding group data exists
              <div
                key={configGroup}
                className="w-full text-center text-gray-700 bg-white p-5 border rounded-lg shadow-lg flex-grow">
                <h1 className="text-9xl font-bold mb-4">Highest points </h1>
                <h4 className="text-5xl font-bold mb-4"> {configGroup}</h4>
                <div className="flex flex-col justify-between">
                    {Object.keys(groupedStudents[configGroup]).map(
                      (rank, index) =>
                        parseInt(rank) <= 5 && (
                          <div
                            key={rank}
                            className="mb-4 last:mb-0"
                            style={{
                              transition: `transform 0.5s ease-in-out ${
                                index * 0.1
                              }s`,
                            }}
                          >
                            <div className="flex items-center p-4 bg-gray-100 rounded-lg shadow-md">
                              <div
                                className="text-9xl font-extrabold text-center text-black-700 flex-shrink-0"
                                style={{ width: "120px" }}
                              >
                                {rank}
                              </div>
                              <div className="flex-grow">
                                <div className="flex flex-wrap">
                                  {groupedStudents[configGroup][rank].map(
                                    (student) => (
                                      <div
                                        key={`${student.id}-${student.prefix}`}
                                        className="flex items-center m-2 w-full"
                                      >
                                        <div
                                          className="flex-grow p-4 rounded-l-lg shadow-md text-white font-bold text-5xl"
                                          style={{
                                            backgroundColor: getBackgroundColor(
                                              student.group
                                            ),
                                          }}
                                        >
                                          {student.name}
                                        </div>
                                        <div className="flex-shrink-0 ml-auto bg-black p-4 rounded-r-lg shadow-md text-white font-bold text-5xl">
                                          {student.points}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
  );
};

export default StudentRanking;
