import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore"; // Changed getDocs to onSnapshot
import { db } from "./firebase.js";

const StudentRanking = () => {
  const [groupedStudents, setGroupedStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "dvbs"), (querySnapshot) => {
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

      // Filter to get top 5 students per group considering ties and assign ranks
      const topGroups = {};
      for (const group in groups) {
        let rank = 0;
        let lastPoints = null;
        let actualRank = 0;
        topGroups[group] = groups[group].filter((student, index) => {
          if (index < 5 || student.points === lastPoints) {
            if (student.points !== lastPoints) {
              actualRank++;
              rank = actualRank;
            }
            student.rank = rank;
            lastPoints = student.points;
            return true;
          }
          return false;
        });
      }

      // Group students by their ranks within each group
      const groupedByRank = {};
      for (const group in topGroups) {
        groupedByRank[group] = topGroups[group].reduce((acc, student) => {
          if (!acc[student.rank]) {
            acc[student.rank] = [];
          }
          acc[student.rank].push(student);
          return acc;
        }, {});
      }

      setGroupedStudents(groupedByRank);
      setLoading(false);
    });

    return () => {
      // Unsubscribe from the snapshot listener when the component unmounts
      unsubscribe();
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
    return <div></div>;
  }

  return (
    <div className="bg-[#9ca3af] h-screen  overflow-auto">
    <div className="flex justify-center items-center overflow-auto">
      <div className="w-full rounded-lg mx-auto" >
        {Object.keys(groupedStudents).map((group) => (
          <div
            key={group}
            className="w-full max-w-full text-gray-700 bg-white  p-5 border rounded-lg shadow-lg "
          >
            <h2 className="text-9xl font-bold mb-4">{group} Ranking</h2>
            {Object.keys(groupedStudents[group]).map((rank) => (
              <div key={rank} className="mb-4">
                <div className="text-xl font-semibold mb-2">Rank {rank}</div>
                <div className="flex flex-wrap">
                  {groupedStudents[group][rank].map((student) => (
                    <div
                      key={`${student.id}-${student.prefix}`}
                      className="flex items-center m-2 w-full"
                    >
                      <div
                        className="flex-grow p-4 rounded-l-lg shadow-md text-white font-bold text-5xl"
                        style={{
                          backgroundColor: getBackgroundColor(student.group),
                        }}
                      >
                        {student.name}
                      </div>
                      <div className="flex-shrink-0 ml-auto bg-black p-4 rounded-r-lg shadow-md text-white font-bold text-5xl">
                        {student.points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>

  );
};

export default StudentRanking;



// <div className="bg-[#9ca3af] h-screen  overflow-auto">
// <div className="flex justify-center items-center overflow-auto">
//   <div className="w-full rounded-lg mx-auto" style={{ maxWidth: "90%" }}>
//     {Object.keys(groupedStudents).map((group) => (
//       <div
//         key={group}
//         className="w-full max-w-md text-gray-700 bg-white mt-5 p-5 border rounded-lg shadow-lg mx-auto"
//       >
//         <h2 className="text-9xl font-bold mb-4">{group} Ranking</h2>
//         {Object.keys(groupedStudents[group]).map((rank) => (
//           <div key={rank} className="mb-4">
//             <div className="text-xl font-semibold mb-2">Rank {rank}</div>
//             <div className="flex flex-wrap">
//               {groupedStudents[group][rank].map((student) => (
//                 <div
//                   key={`${student.id}-${student.prefix}`}
//                   className="flex items-center m-2 w-full"
//                 >
//                   <div
//                     className="flex-grow p-4 rounded-l-lg shadow-md text-white font-bold text-lg"
//                     style={{
//                       backgroundColor: getBackgroundColor(student.group),
//                     }}
//                   >
//                     {student.name}
//                   </div>
//                   <div className="flex-shrink-0 ml-auto bg-black p-4 rounded-r-lg shadow-md text-white font-bold text-lg">
//                     {student.points}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     ))}
//   </div>
// </div>
// </div>
