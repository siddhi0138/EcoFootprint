import React from 'react';
import { Button } from '../components/ui/button';
import { useCart } from '../contexts/CartContext';
import { Plus, Minus, Trash2 } from 'lucide-react';

const Checkout = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const totalPrice = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return sum + price * quantity;
  }, 0);

  const handleConfirmPurchase = () => {
    alert('Purchase confirmed! (This is a placeholder)');
    clearCart();
    onNavigate('marketplace');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md dark:bg-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Checkout</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {cartItems.map((item) => (
              <li key={item.id} className="flex items-center py-4">
                <img
                  src={item.image || '/api/placeholder/64/64'}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover mr-4"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-gray-900 dark:text-gray-100">{item.quantity || 1}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeFromCart(item.id)}
                  className="ml-4"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Total: ${totalPrice.toFixed(2)}
            </span>
            <Button onClick={handleConfirmPurchase} className="bg-emerald-600 hover:bg-emerald-700">
              Confirm Purchase
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Checkout;
