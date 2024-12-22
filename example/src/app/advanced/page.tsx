import React from 'react';
import CounterWithDisconnect from '../components/CounterWithDisconnect';

const MinimalPage: React.FC = () => {
  return (
    <div>
      <h1>Counter With Disconnect and multiple SSE Routes Example</h1>
      <CounterWithDisconnect />
    </div>
  );
};

export default MinimalPage;
