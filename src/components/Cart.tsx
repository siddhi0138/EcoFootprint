import React from 'react';
import { Button } from './ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext'; // Import useCart hook
import { Skeleton } from './ui/skeleton'; // Import Skeleton for loading state

// Define the CartItem interface, assuming it's not defined elsewhere globally
// If it's defined in CartContext or another file, you should update it there
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string; // Optional image property
  brand: string; // Added brand property
}

const Cart = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  // Use the cart context
  const { cartItems, updateQuantity, removeFromCart, clearCart, loadingCart } = useCart();

  // Calculate total price from context cartItems
  const totalPrice = cartItems.reduce((sum, item) => {
    const itemPrice = typeof item.price === 'number' ? item.price : 0;
    const itemQuantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return sum + (itemPrice * itemQuantity);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md dark:bg-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">Your cart is empty.</p>
      ) : loadingCart ? (
        // Add a loading state using Skeleton if needed
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {cartItems.map((item) => (
              <li key={item.id} className="flex items-center py-4">
                <img src={item.image || '/api/placeholder/64/64'} alt={item.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.name}</h3>
                  {/* Assuming 'brand' might still be a property, otherwise remove */}
                  {item.brand && <p className="text-sm text-gray-600 dark:text-gray-400">{item.brand}</p>}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {console.log('Update quantity:', item.id, item.quantity - 1); updateQuantity(item.id, item.quantity - 1)}}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-gray-900 dark:text-gray-100">{item.quantity || 1}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {console.log('Update quantity:', item.id, item.quantity + 1); updateQuantity(item.id, item.quantity + 1)}}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button size="sm" variant="destructive" onClick={() => {console.log('Remove item:', item.id); removeFromCart(item.id)}} className="ml-4">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total: ${totalPrice.toFixed(2)}</span>
            <Button variant="destructive" onClick={() => clearCart()}>Clear Cart</Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-end">
            <Button variant="outline" onClick={() => setActiveTab('marketplace')}>Continue Shopping</Button>
            <Button onClick={() => alert('Proceed to Checkout (Not implemented)')}>Checkout</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
