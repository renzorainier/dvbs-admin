import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';
import { Menu, Transition } from '@headlessui/react';
// import { ChevronDownIcon } from '@heroicons/react/solid';

const StudentRanking = () => {
  const [groupedStudents, setGroupedStudents] = useState({});
  const [overallStudents, setOverallStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState('All');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'dvbs'), (querySnapshot) => {
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
    });

    return () => {
      // Unsubscribe from the snapshot listener when the component unmounts
      unsubscribe();
    };
  }, []);

  const getCurrentDayLetter = () => {
    const days = ['A', 'B', 'C', 'D', 'E'];
    const dayIndex = new Date().getDay();
    return days[dayIndex >= 1 && dayIndex <= 5 ? dayIndex - 1 : 4];
  };

  const getBackgroundColor = (group) => {
    switch (group) {
      case "primary":
        return "#FFC100";
      case "middlers": // Assuming 'mi' stands for middlers
        return "#04d924";
      case "juniors": // Assuming 'ju' stands for juniors
        return "#027df7";
      case "youth": // Assuming 'yo' stands for youth
        return "#f70233";
      default:
        return "#FFFFFF"; // Default color if no match
    }
  };

  if (loading) {
    return <div></div>;
  }

  const groups = ['All', ...Object.keys(groupedStudents)];

  return (
    <div className="bg-[#9ca3af] h-screen overflow-auto">
      <div className="flex justify-center items-center overflow-auto">
        <div className="w-full rounded-lg mx-auto" style={{ maxWidth: '90%' }}>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
              {currentGroup}
              {/* <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" /> */}
            </Menu.Button>
            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1 ">
                  {groups.map((group, index) => (
                    <Menu.Item key={index}>
                      {({ active }) => (
                        <button
                          onClick={() => setCurrentGroup(group)}
                          className={`${
                            active ? 'bg-blue-500 text-white' : 'text-gray-900'
                          } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                        >
                          {group}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {currentGroup === 'All' && (
            <div className="w-full max-w-md text-gray-700 bg-white mt-5 p-5 border rounded-lg shadow-lg mx-auto">
              <h2 className="text-2xl font-bold mb-4">Overall Ranking</h2>
              {overallStudents.map(student => (
                <div
                  key={`${student.id}-${student.prefix}`}
                  className="flex items-center mb-4"
                >
                  <button
                    className="flex-1 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700"
                    style={{ backgroundColor: getBackgroundColor(student.group) }}
                    onClick={() => {}}
                  >
                    {student.name} - {student.points} points
                  </button>
                </div>
              ))}
            </div>
          )}

          {currentGroup !== 'All' && (
            <div key={currentGroup} className="w-full max-w-md text-gray-700 bg-white mt-5 p-5 border rounded-lg shadow-lg mx-auto">
              <h2 className="text-2xl font-bold mb-4">{currentGroup} Ranking</h2>
              {groupedStudents[currentGroup].map(student => (
                <div
                  key={`${student.id}-${student.prefix}`}
                  className="flex items-center mb-4"
                >
                  <button
                    className="flex-1 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700"
                    style={{ backgroundColor: getBackgroundColor(student.group) }}
                    onClick={() => {}}
                  >
                    {student.name} - {student.points} points
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRanking;