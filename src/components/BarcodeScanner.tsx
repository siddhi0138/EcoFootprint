
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scan, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string, productData: any) => void;
}

const BarcodeScanner = ({ onBarcodeScanned }: BarcodeScannerProps) => {
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setScanning(true);
    
    // Simulate barcode lookup
    setTimeout(() => {
      const mockProducts: Record<string, any> = {
        '123456789012': {
          name: 'Coca-Cola Classic 12oz',
          brand: 'Coca-Cola',
          category: 'Beverages',
          image: '🥤',
          description: 'Classic Coca-Cola soft drink in aluminum can'
        },
        '987654321098': {
          name: 'iPhone 15 Pro',
          brand: 'Apple',
          category: 'Electronics',
          image: '📱',
          description: 'Latest iPhone with titanium design'
        }
      };

      const product = mockProducts[barcode] || {
        name: `Product ${barcode}`,
        brand: 'Unknown Brand',
        category: 'Consumer Product',
        image: '📦',
        description: 'Product information retrieved from barcode database'
      };

      onBarcodeScanned(barcode, product);
      setScanning(false);
      setBarcode('');
      
      toast({
        title: "Product Found",
        description: `Found ${product.name} in database`,
      });
    }, 1500);
  };

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scan className="h-5 w-5 text-emerald-600" />
          <span>Barcode Scanner</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBarcodeSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter barcode number or scan..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="pl-10"
              disabled={scanning}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              disabled={scanning || !barcode.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 flex-1"
            >
              {scanning ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Looking up...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Database
                </>
              )}
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              className="border-emerald-300 text-emerald-700"
              disabled={scanning}
            >
              <Scan className="h-4 w-4 mr-2" />
              Scan
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Try: 123456789012 (Coca-Cola) or 987654321098 (iPhone)
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
