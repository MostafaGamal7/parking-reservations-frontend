import { useEffect, useState } from "react";
import { getJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Printer } from "lucide-react";
import { format } from "date-fns";

interface BreakdownItem {
  from: string;
  to: string;
  hours: number;
  rateMode: "normal" | "special";
  rate: number;
  amount: number;
}

interface SubscriptionCar {
  plate: string;
  brand: string;
  model: string;
  color: string;
}

interface SubscriptionDetails {
  id: string;
  userName: string;
  cars: SubscriptionCar[];
  expiresAt: string;
}

interface TicketDetailsProps {
  ticket: {
    id: string;
    type: "visitor" | "subscriber";
    zoneId: string;
    zoneName: string;
    checkinAt: string;
    checkoutAt?: string;
    subscriptionId?: string;
  };
  subscription?: SubscriptionDetails | null;
  breakdown: BreakdownItem[];
  totalAmount: number;
  durationHours: number;
  error?: string | null;
  successMessage?: string | null;
  onCheckout: (forceConvertToVisitor?: boolean) => Promise<void>;
  onNewLookup: () => void;
}

export function TicketDetails({
  ticket,
  subscription,
  breakdown,
  totalAmount,
  durationHours,
  error = null,
  successMessage = null,
  onCheckout,
  onNewLookup,
}: TicketDetailsProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [forceConvert, setForceConvert] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [manualSubscriptionId, setManualSubscriptionId] = useState<string>("");
  const [previewSub, setPreviewSub] = useState<SubscriptionDetails | null>(
    null
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [observedPlate, setObservedPlate] = useState<string>("");

  // Compare observed plate with subscription cars (from loaded subscription or previewed subscription)
  const currentCars = (subscription?.cars || previewSub?.cars || []).map((c) =>
    (c.plate || "").trim().toLowerCase()
  );
  const normalizedObserved = observedPlate.trim().toLowerCase();
  const plateMatches =
    normalizedObserved === "" || currentCars.includes(normalizedObserved);

  // Auto toggle convert when mismatch; employee can still override
  useEffect(() => {
    if (ticket.type === "subscriber") {
      setForceConvert(!plateMatches);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plateMatches, ticket.type]);

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      await onCheckout(forceConvert);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  return (
    <div className="space-y-6">
      <Card className="print:shadow-none print:border-0">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Ticket #{ticket.id}</CardTitle>
              <div className="flex items-center mt-1">
                <Badge
                  variant={ticket.type === "subscriber" ? "default" : "outline"}
                >
                  {ticket.type === "subscriber" ? "Subscriber" : "Visitor"}
                </Badge>
                <span className="ml-2 text-sm text-gray-500">
                  {ticket.zoneId}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Check-in Details
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Check-in Time:</dt>
                  <dd className="font-medium">
                    {format(new Date(ticket.checkinAt), "PPpp")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Duration:</dt>
                  <dd className="font-medium">
                    {durationHours.toFixed(2)} hours
                  </dd>
                </div>
                {ticket.type === "subscriber" && subscription && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Subscription
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Subscriber:</dt>
                        <dd className="font-medium">{subscription.userName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Expires:</dt>
                        <dd className="font-medium">
                          {format(new Date(subscription.expiresAt), "PP")}
                        </dd>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={observedPlate}
                          onChange={(e) => setObservedPlate(e.target.value)}
                          placeholder="Observed license plate"
                          className="flex-1 border rounded px-2 py-1 text-sm"
                        />
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            plateMatches
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {plateMatches
                            ? "Plate matches"
                            : "Mismatch → convert to visitor"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {ticket.type === "subscriber" && !subscription && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Subscription
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={manualSubscriptionId}
                        onChange={(e) =>
                          setManualSubscriptionId(e.target.value)
                        }
                        placeholder="Enter subscription ID (optional)"
                        className="flex-1 border rounded px-2 py-1 text-sm"
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={async () => {
                          const id = manualSubscriptionId.trim();
                          if (!id) return;
                          setPreviewError(null);
                          setIsLoadingPreview(true);
                          try {
                            const sub = await getJson<SubscriptionDetails>(
                              `/subscriptions/${id}`
                            );
                            setPreviewSub(sub);
                          } catch (err) {
                            setPreviewSub(null);
                            setPreviewError(
                              err instanceof Error
                                ? err.message
                                : "Failed to load subscription"
                            );
                          } finally {
                            setIsLoadingPreview(false);
                          }
                        }}
                      >
                        {isLoadingPreview ? "Loading..." : "View"}
                      </Button>
                    </div>
                    {previewError && (
                      <p className="text-xs text-red-600 mt-2">
                        {previewError}
                      </p>
                    )}
                    {previewSub && (
                      <div className="mt-3">
                        <div className="flex gap-2 text-sm mb-2">
                          <span className="text-gray-500">Subscriber:</span>
                          <span className="font-medium">
                            {previewSub.userName}
                          </span>
                        </div>
                        {previewSub.cars?.length ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {previewSub.cars.map((car, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-3"
                              >
                                <div className="font-medium">{car.plate}</div>
                                <div className="text-sm text-gray-600">
                                  {car.brand} {car.model}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {car.color}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">
                            No vehicles registered.
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-3">
                          <input
                            type="text"
                            value={observedPlate}
                            onChange={(e) => setObservedPlate(e.target.value)}
                            placeholder="Observed license plate"
                            className="flex-1 border rounded px-2 py-1 text-sm"
                          />
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              plateMatches
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {plateMatches
                              ? "Plate matches"
                              : "Mismatch → convert to visitor"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Charges</h3>
              <div className="space-y-2">
                {breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-500">
                        {format(new Date(item.from), "h:mma")} -{" "}
                        {format(new Date(item.to), "h:mma")}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {item.rateMode}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div>
                        {item.hours.toFixed(2)} hrs × ${item.rate.toFixed(2)}
                      </div>
                      <div className="font-medium">
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {ticket.type === "subscriber" && subscription?.cars && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-3">
                Registered Vehicles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subscription.cars.map((car, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="font-medium">{car.plate}</div>
                    <div className="text-sm text-gray-600">
                      {car.brand} {car.model}
                    </div>
                    <div className="text-xs text-gray-500">{car.color}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center">
                <input
                  id="force-convert"
                  type="checkbox"
                  checked={forceConvert}
                  onChange={(e) => setForceConvert(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="force-convert"
                  className="ml-2 text-sm text-gray-700"
                >
                  Convert to visitor (plate doesn&apos;t match)
                </label>
              </div>
            </div>
          )}

          {successMessage && (
            <Alert className="mt-4">
              <AlertDescription className="text-green-50 font-bold p-1 bg-green-600 rounded-sm w-fit">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut || !!ticket?.checkoutAt}
              className="flex-1"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Check Out"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1"
            >
              <Printer className="mr-2 h-4 w-4" />
              {isPrinting ? "Printing..." : "Print Receipt"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\:shadow-none,
          .print\:border-0,
          .print\:shadow-none *,
          .print\:border-0 * {
            visibility: visible;
          }
          .print\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
