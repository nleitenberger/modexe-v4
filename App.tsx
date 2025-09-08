import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store';
import MainNavigator from './src/components/navigation/MainNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <MainNavigator />
      <StatusBar style="auto" />
    </Provider>
  );
}
