
// index.ts
// This is the entry point for the Expo/React Native app.
// It registers the main App component so the app can run on iOS, Android, or web.

import { registerRootComponent } from 'expo';
import App from './App';

// This ensures the app is set up correctly for all platforms
registerRootComponent(App);
