import { useEffect, useState } from 'react';
import { Logo, LogoText } from '../components/logo';

interface SplashProps {
  onComplete: () => void;
  isReady?: boolean;
}

export function Splash({ onComplete, isReady = true }: SplashProps) {
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimePassed && isReady) {
      onComplete();
    }
  }, [minTimePassed, isReady, onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 relative">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="mb-4">
          <Logo size="xl" />
        </div>
        
        <h1 className="mt-4">
          <LogoText size="lg" />
        </h1>
        
        <p className="text-gray-500 text-center mt-6 text-sm font-medium">
          The ultimate platform<br />
          for teamwork.
        </p>
      </div>

      <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden mb-12">
        <div className="w-1/2 h-full bg-primary animate-pulse rounded-full" />
      </div>
    </div>
  );
}
