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
        const querySnapshot = await getDocs(collection(db, 'students'));
        const studentData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentData);
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
      const studentPoints = students.map(student => {
        const points = student[`0${currentDayLetter}points`] || 0;
        return { ...student, points };
      });

      const groupA = studentPoints.filter(student => student.group === 'A').sort((a, b) => b.points - a.points);
      const groupB = studentPoints.filter(student => student.group === 'B').sort((a, b) => b.points - a.points);
      const groupC = studentPoints.filter(student => student.group === 'C').sort((a, b) => b.points - a.points);
      const groupD = studentPoints.filter(student => student.group === 'D').sort((a, b) => b.points - a.points);
      const groupE = studentPoints.filter(student => student.group === 'E').sort((a, b) => b.points - a.points);
      const overall = studentPoints.sort((a, b) => b.points - a.points);

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
