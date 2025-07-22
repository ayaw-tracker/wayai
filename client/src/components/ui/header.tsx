import { Menu, User, ChevronDown } from "lucide-react";
import { Button } from "./button";
import { Link, useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { useSport } from "@/contexts/sport-context";

export default function Header() {
  const [location] = useLocation();
  const { selectedSport, setSelectedSport, availableSports } = useSport();

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'NFL': return '🏈';
      case 'NBA': return '🏀';
      case 'MLB': return '⚾';
      default: return '🏈';
    }
  };

  return (
    <header className="bg-dark-secondary border-b border-dark-tertiary px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <div className="text-2xl font-bold text-accent-green cursor-pointer">WAY</div>
          </Link>
          <div className="text-text-secondary text-sm">Who's Actually Winning?</div>
          
          {/* Sport Selector */}
          <div className="hidden md:block">
            <Select value={selectedSport} onValueChange={(value) => setSelectedSport(value as any)}>
              <SelectTrigger className="w-32 bg-dark border-dark-tertiary text-text-primary">
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-dark-tertiary">
                {availableSports.map((sport) => (
                  <SelectItem key={sport} value={sport} className="text-text-primary">
                    <div className="flex items-center gap-2">
                      <span>{getSportIcon(sport)}</span>
                      <span>{sport}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className={`transition-colors ${
              isActive('/') 
                ? 'text-accent-green font-medium' 
                : 'text-text-secondary hover:text-text-primary'
            }`}>
              Dashboard
          </Link>


          <Link href="/tail-watch" className={`transition-colors ${
              isActive('/tail-watch') 
                ? 'text-accent-green font-medium' 
                : 'text-text-secondary hover:text-text-primary'
            }`}>
              Tail Watch
          </Link>
          <Link href="/ai-chat" className={`transition-colors ${
              isActive('/ai-chat') 
                ? 'text-accent-green font-medium' 
                : 'text-text-secondary hover:text-text-primary'
            }`}>
              AI Chat
          </Link>
          <Link href="/settings" className={`transition-colors ${
              isActive('/settings') 
                ? 'text-accent-green font-medium' 
                : 'text-text-secondary hover:text-text-primary'
            }`}>
              Settings
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button className="bg-accent-green hover:bg-green-600 text-white px-4 py-2 text-sm font-medium">
            <User className="w-4 h-4 mr-2" />
            Login
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden text-text-primary">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
