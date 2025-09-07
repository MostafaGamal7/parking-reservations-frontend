import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Printer } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { animateTicketModalIn, animateTicketModalOut } from '@/lib/animations';
import Image from 'next/image';
import { TicketData } from '@/types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: unknown;
}


export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  
  const modalRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Animation on open/close
  useGSAP(() => {
    if (!ticketRef.current) return;
    
    if (isOpen && ticket && typeof ticket === 'object' && ticket !== null) {
      // Animate in when opening
      const ctx = gsap.context(() => {
        animateTicketModalIn(ticketRef.current);
      }, ticketRef);
      
      return () => ctx.revert();
    } else if (!isOpen) {
      // Animate out when closing
      const ctx = gsap.context(() => {
        animateTicketModalOut(ticketRef.current);
      }, ticketRef);
      
      return () => ctx.revert();
    }
  }, [isOpen, ticket]);

  const handlePrint = () => {
    if (ticketRef.current) {
      gsap.to(ticketRef.current, {
        scale: 0.98,
        duration: 0.1,
        onComplete: () => {
          window.print();
          gsap.to(ticketRef.current, {
            scale: 1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)'
          });
        }
      });
    } else {
      window.print();
    }
  };

  if (!ticket || typeof ticket !== 'object' || ticket === null) return null;

  // Safely cast the ticket to our TicketData type
  const ticketData = ticket as TicketData;

  // Format the check-in time with null checks
  const checkInTime = ticketData.checkInAt ? new Date(ticketData.checkInAt).toLocaleString() : 'N/A';
  const expiryTime = ticketData.expiresAt ? new Date(ticketData.expiresAt).toLocaleString() : 'N/A';
  const amount = ticketData.amount !== undefined ? `$${ticketData.amount.toFixed(2)}` : 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-md"
        ref={modalRef}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Check-in Successful!
          </DialogTitle>
        </DialogHeader>
        
        <div 
          ref={ticketRef}
          className="border rounded-lg p-6 bg-white shadow-lg print:shadow-none print:border-0 print:p-0"
        >
          {/* Ticket Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Parking Ticket</h2>
            <p className="text-sm text-gray-500">Ticket ID: {ticketData.id || 'N/A'}</p>
          </div>
          
          {/* Ticket Content */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Ticket ID:</span>
              <span className="font-mono font-medium">{ticketData.id || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Zone:</span>
              <p className="font-medium">{ticketData.zoneName || 'N/A'}</p>
            </div>
            
            <div className="flex justify-between">
              <p className="text-sm text-gray-600">Check-in: {checkInTime}</p>
              <span className="font-medium">{checkInTime}</span>
            </div>
            
            {ticketData.expiresAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Expires At:</span>
                <span className="font-medium">{expiryTime}</span>
              </div>
            )}
            
            {ticketData.amount !== undefined && (
              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-4">
                <span>Total:</span>
                <span>{amount}</span>
              </div>
            )}
            
            {ticketData.qrCode && (
              <div className="mt-6 flex justify-center">
                {ticketData.qrCode && (
                  <Image 
                    src={ticketData.qrCode} 
                    alt="QR Code" 
                    width={128} 
                    height={128} 
                    className="w-32 h-32 mx-auto"
                    unoptimized={ticketData.qrCode.startsWith('data:')}
                  />
                )}
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-4 text-center">
              <p>Present this ticket when exiting the parking lot.</p>
              <p>Losing this ticket may result in additional charges.</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-6 flex gap-3 print:hidden">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
            <Button 
              className="flex-1 gap-2"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              Print Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketModal;
