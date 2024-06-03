import React, { useState } from 'react';

const Password = ({ correctPassword, children }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="">
      {isAuthenticated ? (
        children
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-lg">
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className="border border-gray-400 rounded px-3 py-2 mb-4 block w-full"
            placeholder="Enter password"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default Password;
