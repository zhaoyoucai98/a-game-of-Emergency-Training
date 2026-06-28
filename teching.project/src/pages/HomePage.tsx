import { Link } from 'react-router-dom';
import { Heart, Award, BookOpen } from 'lucide-react';
import { Character, Companion, UiBtn } from '@/components/Character';

function HomePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
      style={{
        backgroundImage: "url('/image/scene-home.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 半透明白色遮罩，提升文字可读性 */}
      <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {/* 角色欢迎区 */}
        <div className="flex items-end justify-center gap-2 mb-2">
          <Companion who="xiaohei" size="sm" floating />
          <Character pose="idle" size="lg" floating />
          <Companion who="grandpa" size="sm" floating />
        </div>

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Heart className="w-12 h-12 text-alert animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold text-primary drop-shadow-md">
              急救小先锋
            </h1>
          </div>
          <p className="text-xl text-gray-700 font-medium drop-shadow-sm">
            和小泉一起，寓教于乐，学会救人
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Link
            to="/levels"
            className="card hover:scale-105 transition-transform bg-white/90 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center text-center">
              <UiBtn kind="start" size="sm" className="mb-3" />
              <h2 className="text-2xl font-bold mb-2">开始游戏</h2>
              <p className="text-gray-600">进入关卡地图</p>
            </div>
          </Link>

          <Link
            to="/quiz"
            className="card hover:scale-105 transition-transform bg-white/90 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center text-center">
              <BookOpen className="w-12 h-12 text-life mb-3" />
              <h2 className="text-2xl font-bold mb-2">知识问答</h2>
              <p className="text-gray-600">挑战急救常识</p>
            </div>
          </Link>

          <Link
            to="/achievements"
            className="card hover:scale-105 transition-transform md:col-span-2 bg-white/90 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center text-center">
              <Award className="w-12 h-12 text-warm mb-3" />
              <h2 className="text-2xl font-bold mb-2">我的成就</h2>
              <p className="text-gray-600">查看徽章和进度</p>
            </div>
          </Link>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-700 bg-white/70 px-4 py-2 rounded-full">
          <p>⚠️ 本游戏仅为教学，实际急救请遵循专业指导</p>
        </footer>
      </div>
    </div>
  );
}

export default HomePage;
