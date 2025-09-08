import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, QrCode, Loader2 } from 'lucide-react';

interface TicketLookupFormProps {
  onLookup: (ticketId: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function TicketLookupForm({ onLookup, isLoading, error }: TicketLookupFormProps) {
  const [ticketId, setTicketId] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    await onLookup(ticketId.trim());
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ticketId">Ticket ID or QR Code</Label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <Input
            id="ticketId"
            name="ticketId"
            type="text"
            placeholder="Enter ticket ID or scan QR code"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className="flex-1 min-w-0 rounded-r-none"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowScanner(!showScanner)}
            className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <QrCode className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showScanner && (
        <div className="border rounded-md p-4 bg-gray-50">
          <div className="aspect-square max-w-xs mx-auto bg-black/5 flex items-center justify-center rounded-md mb-2">
            <p className="text-sm text-gray-500">QR Scanner Placeholder</p>
          </div>
          <p className="text-xs text-center text-gray-500">
            Position the QR code within the frame to scan
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        onClick={handleSubmit}
        className="w-full"
        disabled={!ticketId.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Looking up...
          </>
        ) : (
          'Lookup Ticket'
        )}
      </Button>
    </div>
  );
}
