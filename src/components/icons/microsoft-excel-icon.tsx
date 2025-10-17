import React from "react";

interface MicrosoftExcelIconProps {
  className?: string;
  size?: number;
}

export const MicrosoftExcelIcon: React.FC<MicrosoftExcelIconProps> = ({
  className = "",
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3v18h18V3H3z"
        fill="#1F7244"
      />
      <path
        d="M21 8V3H8v5h13z"
        fill="#0F5132"
      />
      <path
        d="M21 16V8H8v8h13z"
        fill="#107C41"
      />
      <path
        d="M21 21v-5H8v5h13z"
        fill="#0F5132"
      />
      <path
        d="M3 21h5V3H3v18z"
        fill="#185C37"
      />
      <path
        d="M14.5 11L12 9v4l2.5-2z"
        fill="white"
      />
      <path
        d="M10.5 13L13 15v-4l-2.5 2z"
        fill="white"
      />
    </svg>
  );
};

export default MicrosoftExcelIcon;
