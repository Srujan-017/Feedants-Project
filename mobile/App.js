import { StatusBar } from 'expo-status-bar';
import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen';

export default function App() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#f7fbfb" />
      <CompetitionDetailsScreen />
    </>
  );
}
