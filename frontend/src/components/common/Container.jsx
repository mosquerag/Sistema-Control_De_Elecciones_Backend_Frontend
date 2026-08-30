import React from "react";

const Container = ({ children, className = "" }) => {
  return (
    <div
      className={`max-w-6xl mx-auto p-6 rounded-2xl shadow-md border transition-all duration-300 
      border-orange-500 dark:border-white bg-white dark:bg-gray-900 ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
