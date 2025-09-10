import React from "react";

const Page = () => {
  return (
    <div>
      <iframe
        src={`/api/admin/viewer-pdf?inline=1`}
        className="w-full h-screen"
      />
    </div>
  );
};

export default Page;
