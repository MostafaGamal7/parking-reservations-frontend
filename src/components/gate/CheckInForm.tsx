import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Car, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { Zone } from '@/types/zone';
import { TicketData } from '@/types';

type FormData = {
  licensePlate: string;
};

interface CheckInFormProps {
  onSubmit: (data: { licensePlate: string; zoneId: string }) => Promise<{
    ticket: TicketData;
} | undefined>;
  isSubmitting: boolean;
  error?: string | null | undefined;
  selectedZone: Zone | null;
  className?: string;
  isVisitor?: boolean;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({
  onSubmit,
  isSubmitting,
  error,
  selectedZone,
  className,
  isVisitor,
}) => {
  const { register, formState: { errors }, watch } = useForm<FormData>();
  const licensePlate = watch('licensePlate', '');
  const isFormValid = !!selectedZone && !!licensePlate.trim();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedZone) {
      logger.error('No zone selected');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const licensePlateValue = formData.get('licensePlate');
    const trimmedLicensePlate = licensePlateValue ? String(licensePlateValue).trim() : '';

    if (!trimmedLicensePlate) {
      logger.error('License plate is required');
      return;
    }

    // Only proceed with check-in if we have all required data
    onSubmit({
      licensePlate: trimmedLicensePlate,
      zoneId: selectedZone.id,
    });
  };

  const handleFormClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={cn('space-y-4', className)}>
      <form
        onSubmit={handleFormSubmit}
        onClick={(e) => e.stopPropagation()}
        className="space-y-4"
      >
        {/* License Plate Input */}
        <div className="space-y-2">
          <Label htmlFor="licensePlate" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            License Plate
          </Label>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="licensePlate"
              placeholder="Enter license plate"
              disabled={isSubmitting}
              className={cn(
                'pl-10 ring-1 ring-black-100 focus:ring-offset-black',
                errors.licensePlate && 'border-red-500 focus-visible:ring-red-500'
              )}
              onKeyDown={handleInputKeyDown}
              onClick={handleFormClick}
              {...register('licensePlate', {
              required: 'License plate is required',
              minLength: {
                value: 2,
                message: 'License plate must be at least 2 characters',
              },
              maxLength: {
                value: 20,
                message: 'License plate cannot exceed 20 characters',
              },
              validate: (value) => {
                if (!value?.trim()) return 'License plate cannot be empty';
                return true;
              },
            })}
          />
        </div>
        {errors.licensePlate && (
            <p className="text-sm text-red-500">{errors.licensePlate.message}</p>
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
          onClick={(e) => {
            e.stopPropagation();
            if (!isFormValid || isSubmitting) {
              e.preventDefault();
            }
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : 'Check In'}
        </Button>
        
        {/* Zone Information */}
        {selectedZone && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Zone Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total Slots:</div>
              <div className="font-medium">{selectedZone.totalSlots}</div>
              <div>Available Slots:</div>
              <div className="font-medium">
                {isVisitor ? selectedZone.availableForVisitors : selectedZone.availableForSubscribers}
              </div>
              <div>Reserved:</div>
              <div className="font-medium">{selectedZone.reservedSlots || 0}</div>
            </div>
          </div>
        )}
      </form>
      
      <div className="text-xs text-gray-500 mt-2">
        <p>By checking in, you agree to our terms and conditions.</p>
      </div>
    </div>
  );
};

export default CheckInForm;
