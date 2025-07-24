import React from "react";

export const MessageInputError = ({ error }: { error: any }) => {
  if (error) {
    return (
      <p className="text-xs text-red-500 before:content-['*'] pl-3">{error}</p>
    );
  }
  return null;
};
