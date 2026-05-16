import type { Dispatch, SetStateAction } from 'react';
import MainApp from '../MainApp';

interface HomeProps {
  themeMode: 'light' | 'dark';
  setThemeMode: Dispatch<SetStateAction<'light' | 'dark'>>;
}

export default function Home({ themeMode, setThemeMode }: HomeProps) {
  return <MainApp themeMode={themeMode} setThemeMode={setThemeMode} />;
}
