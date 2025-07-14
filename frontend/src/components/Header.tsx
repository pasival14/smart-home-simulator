import { Home } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home className="w-8 h-8 text-sky-400" />
          <h1 className="text-2xl font-bold tracking-tight">
            Smart Home Simulator
          </h1>
        </div>
        <div className="text-sm text-slate-400">
          Status: <span className="text-green-400 font-semibold">Connected</span>
        </div>
      </div>
    </header>
  );
};

export default Header;