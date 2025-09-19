import React from 'react';
import { ConfigProvider, theme } from 'antd';
import CustomerManagement from './components/CustomerManagement';
import './App.css';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <div className="App">
        <CustomerManagement />
      </div>
    </ConfigProvider>
  );
};

export default App;
