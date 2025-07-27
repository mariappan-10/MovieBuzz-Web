import React from 'react';

const TestHome: React.FC = () => {
  return (
    <div className="movie-search">
      <div className="search-header">
        <h1>Welcome to MovieBuzz</h1>
        <p>This is a test to see if the homepage loads correctly</p>
      </div>
      
      <div style={{ padding: '20px', background: 'white', borderRadius: '10px', margin: '20px 0' }}>
        <h2>Test Page</h2>
        <p>If you can see this, the routing and basic components are working.</p>
        <p>The issue might be with the MovieSearch component specifically.</p>
      </div>
    </div>
  );
};

export default TestHome;