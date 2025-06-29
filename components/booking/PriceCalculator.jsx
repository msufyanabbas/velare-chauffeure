import React from 'react';
import { formatCurrency } from '../../lib/utils';
import Card from '../ui/Card';

const PriceCalculator = ({ bookingData, priceData }) => {
  if (!priceData) return null;
  return (
    <Card variant="luxury" className="mt-8">
      <h3 className="text-xl font-serif text-white mb-4">Booking Summary</h3>
      
      <div className="space-y-3 text-gray-300">
        <div className="flex justify-between">
          <span>Distance:</span>
          <span>{priceData.distance} miles</span>
        </div>
        
        <div className="flex justify-between">
          <span>Base fare ({bookingData.vehicleType}):</span>
          <span>{formatCurrency(priceData.basePrice)}</span>
        </div>
        
        {priceData.serviceCharges > 0 && (
          <div className="flex justify-between">
            <span>Additional services:</span>
            <span>{formatCurrency(priceData.serviceCharges)}</span>
          </div>
        )}
        
        <div className="border-t border-gray-600 pt-3">
          <div className="flex justify-between text-white text-lg font-semibold">
            <span>Total:</span>
            <span className="text-gold-400">{formatCurrency(priceData.totalPrice)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PriceCalculator;