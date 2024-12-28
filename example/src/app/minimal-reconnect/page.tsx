import React from 'react';
import Counter from '../components/Counter';

const MinimalPage: React.FC = () => {
  return (
    <div>
      <h1>Minimal Reconnect Example</h1>
      <p> This example demonstrates how to reconnect to a server-sent event stream after it has been closed. </p>
      <Counter reconnect />
    </div>
  );
};

export default MinimalPage;
