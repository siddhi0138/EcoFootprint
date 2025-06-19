import React from 'react';
import { Button } from './ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';

const Cart = ({ cart, setCart, setActiveTab }) => {
  const updateQuantity = (index, delta) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      const item = newCart[index];
      const newQuantity = (item.quantity || 1) + delta;
      if (newQuantity < 1) return newCart;
      newCart[index] = { ...item, quantity: newQuantity };
      return newCart;
    });
  };

  const removeItem = (index) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart.splice(index, 1);
      return newCart;
    });
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Shopping Cart</h2>
      {cart.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {cart.map((item, index) => (
              <li key={index} className="flex items-center py-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.brand}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => updateQuantity(index, -1)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-gray-900 dark:text-gray-100">{item.quantity || 1}</span>
                  <Button size="sm" variant="outline" onClick={() => updateQuantity(index, 1)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button size="sm" variant="destructive" onClick={() => removeItem(index)} className="ml-4">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total: ${totalPrice.toFixed(2)}</span>
            <Button onClick={() => setActiveTab('marketplace')}>Continue Shopping</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
