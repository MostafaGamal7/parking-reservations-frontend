import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Zone } from '@/types/zone';
import { TicketData } from '@/types';

type FormData = {
  subscriptionId: string;
};

interface SubscriptionCheckInFormProps {
  onSubmit: (data: { subscriptionId: string; zoneId: string }) => Promise<{
    ticket: TicketData;
} | undefined>;
  isSubmitting: boolean;
  error?: string | null;
  className?: string;
  selectedZone: Zone | null;
}

export const SubscriptionCheckInForm: React.FC<SubscriptionCheckInFormProps> = ({
  onSubmit,
  isSubmitting,
  error,
  className,
  selectedZone,
}) => {
  const { register, formState: { errors }, watch } = useForm<FormData>();
  const subscriptionId = watch('subscriptionId', '');
  const isFormValid = !!selectedZone && !!subscriptionId.trim();
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedZone) return;
    
    const formData = new FormData(e.currentTarget);
    const subscriptionId = formData.get('subscriptionId') as string;
    
    if (!subscriptionId.trim()) return;
    
    onSubmit({
      subscriptionId: subscriptionId.trim(),
      zoneId: selectedZone.id
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <form 
        onSubmit={handleFormSubmit} 
        className="space-y-4"
        onKeyDown={(e) => {
          // Prevent form submission on Enter key when not on the submit button
          if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
        {/* Subscription ID Input */}
        <div className="space-y-2">
          <Label htmlFor="subscriptionId" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription ID
          </Label>
          <div className="relative">
            <Input
              id="subscriptionId"
              placeholder="Enter subscription ID"
              className={cn(
                'pl-10 ring-1 ring-black-100 focus:ring-offset-black',
                errors.subscriptionId && 'border-red-500 focus-visible:ring-red-500'
              )}
              disabled={isSubmitting}
              {...register('subscriptionId')}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errors.subscriptionId && (
            <p className="text-sm text-red-600 mt-1">{errors.subscriptionId.message}</p>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className={cn('w-full', {
            'bg-primary hover:bg-primary/90': isFormValid,
          })}
          disabled={isSubmitting || !isFormValid}
          variant={"default"}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : 'Check In'}
        </Button>
        
        {/* Remaining Gates Info */}
        {selectedZone && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Zone Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total Slots:</div>
              <div className="font-medium">{selectedZone.totalSlots}</div>
              <div>Available Slots:</div>
              <div className="font-medium">{selectedZone.availableSlots}</div>
              <div>Reserved:</div>
              <div className="font-medium">{selectedZone.reservedSlots || 0}</div>
            </div>
          </div>
        )}
      </form>
      
      <div className="text-xs text-gray-500 mt-2">
        <p>Enter your subscription ID to check in. Don&apos;t have one? Please use the visitor check-in option.</p>
      </div>
    </div>
  );
};

export default SubscriptionCheckInForm;
