import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';

const StudentPointsRanking = () => {
  const [students, setStudents] = useState([]);
  const [rankings, setRankings] = useState({ groupA: [], groupB: [], groupC: [], groupD: [], groupE: [], overall: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'dvbs'));
        const studentData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentData);
        console.log('Fetched Students:', studentData); // Log fetched data here
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students: ', error);
        setLoading(false);
      }
    };

    fetchStudents();

    const unsubscribe = onSnapshot(collection(db, 'dvbs'), snapshot => {
      const studentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      const currentDayLetter = getCurrentDayLetter();

      // **Fieldname Reading Logic (similar to Store component):**
      const pointsFieldNamePrefixMap = { // Assuming a mapping between prefixes and field names
        'primary': 'pr',  // Example: 'prApoints' for primary group's day A points
        'middlers': 'mi',
        'juniors': 'ju',
        'youth': 'yo',
      };

      const studentPoints = students.map(student => {
        const prefix = student.prefix;
        const pointsFieldName = `${pointsFieldNamePrefixMap[prefix]}${currentDayLetter}points`;
        const points = student[pointsFieldName] || 0;
        return { ...student, points };
      });

      const groupA = studentPoints.filter(student => student.group === 'A').sort((a, b) => b.points - a.points);
      const groupB = studentPoints.filter(student => student.group === 'B').sort((a, b) => b.points - a.points);
      // ... similar for other groups and overall

      setRankings({ groupA, groupB, groupC, groupD, groupE, overall });
    }
  }, [students]);

  const getCurrentDayLetter = () => {
    const days = ['A', 'B', 'C', 'D', 'E'];
    const dayIndex = new Date().getDay();
    return days[dayIndex >= 1 && dayIndex <= 5 ? dayIndex - 1 : 4];
  };

  return (
    <div className="ranking-component">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h2>Overall Ranking</h2>
          <RankingList students={rankings.overall} />

          <h2>Group A Ranking</h2>
          <RankingList students={rankings.groupA} />

          <h2>Group B Ranking</h2>
          <RankingList students={rankings.groupB} />

          <h2>Group C Ranking</h2>
          <RankingList students={rankings.groupC} />

          <h2>Group D Ranking</h2>
          <RankingList students={rankings.groupD} />

          <h2>Group E Ranking</h2>
          <RankingList students={rankings.groupE} />
        </>
      )}
    </div>
  );
};

const RankingList = ({ students }) => (
  <ul>
    {students.map((student, index) => (
      <li key={student.id}>
        {index + 1}. {student.name} - {student.points} points
      </li>
    ))}
  </ul>
);

export default StudentPointsRanking;