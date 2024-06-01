import React from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { db4 } from './firebaseConfig4'
const CopyDataComponent = () => {
  const copyData = async () => {
    try {
      // Fetch all documents from the "dvbs" collection in db
      const querySnapshot = await getDocs(collection(db, 'dvbs'));
      const dvbsData = [];
      querySnapshot.forEach((doc) => {
        dvbsData.push({ id: doc.id, ...doc.data() });
      });

      // Add each document to the "dvbs" collection in db4
      for (const doc of dvbsData) {
        const { id, ...data } = doc;
        await addDoc(collection(db4, 'dvbs'), data);
      }

      console.log('Data copied successfully');
    } catch (error) {
      console.error('Error copying data: ', error);
    }
  };

  return (
    <div>
      <button className= "bg-white"onClick={copyData}>Copy Data from db to db4</button>
    </div>
  );
};

export default CopyDataComponent;
