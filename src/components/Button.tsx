import React from 'react';

interface ButtonProps {
  content: String;
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button: React.FC<ButtonProps> = ({ content, handleClick }) => {
  return (
    <button className="btn" onClick={handleClick}>
      {content}
    </button>
  );
};
