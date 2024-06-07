import React, { useState } from 'react';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { db4 } from './firebaseConfig4';

const CopyDataComponent = () => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  const copyData = async () => {
    setStatus('Copying data...');
    setError(null);

    try {
      // Fetch all documents from the "dvbs" collection in db
      const querySnapshot = await getDocs(collection(db, 'dvbs'));
      const dvbsData = [];
      querySnapshot.forEach((doc) => {
        dvbsData.push({ id: doc.id, ...doc.data() });
      });

      // Add each document to the "dvbs" collection in db4 with the same document ID
      for (const docData of dvbsData) {
        const { id, ...data } = docData;
        await setDoc(doc(db4, 'dvbs', id), data);
      }

      setStatus('Data copied successfully');
      console.log('Data copied successfully');
    } catch (error) {
      console.error('Error copying data: ', error);
      setError('An error occurred while copying data.');
    } finally {
      setTimeout(() => {
        setStatus('');
        setError(null);
      }, 3000); // Reset status and error messages after 3 seconds
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <button
        className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${status || error ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={copyData}
        disabled={status || error}
      >
        {status || 'Copy Data from db to db4'}
      </button>
      {status && <p className="text-green-500 mt-2">{status}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default CopyDataComponent;
