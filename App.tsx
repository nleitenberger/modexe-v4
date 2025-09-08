import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store';
import JournalEditor from './src/components/journal/JournalEditor';

export default function App() {
  return (
    <Provider store={store}>
      <JournalEditor />
      <StatusBar style="auto" />
    </Provider>
  );
}
