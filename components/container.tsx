import React from "react";

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-6xl w-full mx-auto border-l border-r border-gray-200 dark:border-gray-900 p-4">
      {children}
    </div>
  );
};

export default Container;
