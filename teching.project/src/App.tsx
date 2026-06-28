import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LevelMapPage from './pages/LevelMapPage';
import GamePage from './pages/GamePage';
import QuizPage from './pages/QuizPage';
import AchievementPage from './pages/AchievementPage';
import ChromaKeyDefs from './components/ChromaKeyDefs';

function App() {
  return (
    <>
      {/* 全局 SVG 抠白底滤镜定义（供 <Character>/<Companion>/<Npc> 引用） */}
      <ChromaKeyDefs />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/levels" element={<LevelMapPage />} />
        <Route path="/game/:levelId" element={<GamePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/achievements" element={<AchievementPage />} />
      </Routes>
    </>
  );
}

export default App;
