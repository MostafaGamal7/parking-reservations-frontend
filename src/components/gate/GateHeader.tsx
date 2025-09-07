import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';

interface GateHeaderProps {
  gateId: string;
  gateName?: string;
  isConnected: boolean;
  lastUpdated?: string;
  onRefresh?: () => void;
  className?: string;
}

export const GateHeader: React.FC<GateHeaderProps> = ({
  gateId,
  gateName = `Gate ${gateId}`,
  isConnected,
  lastUpdated,
  onRefresh,
  className,
}) => {
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString()
  );

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className={cn('bg-white shadow-sm rounded-lg p-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{gateName}</h1>
            <p className="text-sm text-gray-500">ID: {gateId}</p>
          </div>
          
          <div className="flex items-center text-sm">
            <span 
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full',
                isConnected 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
              )}
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3.5 w-3.5" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>Disconnected</span>
                </>
              )}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>{currentTime}</span>
          </div>
          
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={!isConnected}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${!isConnected ? 'opacity-50' : ''}`} />
              <span>Refresh</span>
            </Button>
          )}
        </div>
      </div>
      
      {lastUpdated && (
        <div className="mt-2 text-xs text-gray-500 text-right">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </header>
  );
};

export default GateHeader;
