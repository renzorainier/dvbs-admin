import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase.js';

const StudentRanking = () => {
  const [groupedStudents, setGroupedStudents] = useState({});
  const [overallStudents, setOverallStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'dvbs'));
        const studentData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const currentDayLetter = getCurrentDayLetter();
        const presentStudents = studentData
          .map(group => {
            const groupStudents = [];
            for (const key in group) {
              if (key.endsWith(currentDayLetter)) {
                const id = key.slice(0, 2);
                const pointsField = `${id}${currentDayLetter}points`;
                if (group[pointsField]) {
                  groupStudents.push({
                    id: group.id,
                    group: group.id,
                    id,
                    name: group[`${id}name`],
                    location: group[`${id}loc`],
                    points: group[pointsField],
                  });
                }
              }
            }
            return groupStudents;
          })
          .flat();

        console.log('Fetched Students:', presentStudents);

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

        setGroupedStudents(groups);
        setOverallStudents(presentStudents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students: ', error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const getCurrentDayLetter = () => {
    const days = ['A', 'B', 'C', 'D', 'E'];
    const dayIndex = new Date().getDay();
    return days[dayIndex >= 1 && dayIndex <= 5 ? dayIndex - 1 : 4];
  };

  const getBackgroundColor = (id) => {
    switch (id) {
      case "pr": // Assuming 'pr' stands for primary
        return "#FFC100";
      case "mi": // Assuming 'mi' stands for middlers
        return "#04d924";
      case "ju": // Assuming 'ju' stands for juniors
        return "#027df7";
      case "yo": // Assuming 'yo' stands for youth
        return "#f70233";
      default:
        return "#FFFFFF"; // Default color if no match
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-[#9ca3af] h-screen overflow-auto">
      <div className="flex justify-center items-center overflow-auto">
        <div className="w-full rounded-lg mx-auto" style={{ maxWidth: '90%' }}>
          <div className="w-full max-w-md text-gray-700 bg-white mt-5 p-5 border rounded-lg shadow-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Overall Ranking</h2>
            {overallStudents.map(student => (
              <div
                key={`${student.id}-${student.id}`}
                className="flex items-center mb-4"
              >
                <button
                  className="flex-1 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700"
                  style={{ backgroundColor: getBackgroundColor(student.id) }}
                  onClick={() => {}}
                >
                  {student.name} - {student.points} points
                </button>
              </div>
            ))}
          </div>

          {Object.keys(groupedStudents).map(group => (
            <div key={group} className="w-full max-w-md text-gray-700 bg-white mt-5 p-5 border rounded-lg shadow-lg mx-auto">
              <h2 className="text-2xl font-bold mb-4">{group} Ranking</h2>
              {groupedStudents[group].map(student => (
                <div
                  key={`${student.id}-${student.id}`}
                  className="flex items-center mb-4"
                >
                  <button
                    className="flex-1 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700"
                    style={{ backgroundColor: getBackgroundColor(student.id) }}
                    onClick={() => {}}
                  >
                    {student.name} - {student.points} points
                  </button>
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
