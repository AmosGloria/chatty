import React from 'react';

const SearchButton = ({ onChange, value }) => {
  return (
    <div
      style={{
        width: 300,
        height: 50,
        
      }}
    >
      {/* Wrapper to contain SVG and input together */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          border: '1.47px solid #9197B380',
          borderRadius: 8,
          backgroundColor: '#ffffff',
          paddingLeft: 12,
        }}
      >
        {/* SVG Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          width={20}
          height={20}
          style={{ marginRight: 8, color: '#9197B3' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>

        {/* Input */}
        <input
          type="text"
          placeholder="Search"
          value={value}
          onChange={onChange}
          style={{
            border: 'none',
            outline: 'none',
            flexGrow: 1,
            fontSize: 16,
            color: '#333',
            backgroundColor: 'transparent',
          }}
        />
      </div>
    </div>
  );
};

export default SearchButton;
