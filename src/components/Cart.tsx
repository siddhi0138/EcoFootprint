import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Assuming useAuth is in AuthContext.tsx
import { db } from '../firebase'; // Assuming firebase.ts exports 'db'
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const Cart = ({ cart, setCart, setActiveTab }: { cart: any[]; setCart: React.Dispatch<React.SetStateAction<any[]>>; setActiveTab: (tab: string) => void }) => {
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

  const { currentUser } = useAuth();

  // Real-time listener for cart data
  useEffect(() => {
    if (currentUser) {
      const cartDocRef = doc(db, 'carts', currentUser.uid);
      const unsubscribe = onSnapshot(cartDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setCart(docSnap.data().items || []);
        } else {
          setCart([]);
        }
      });

      // Clean up the listener on component unmount
      return () => unsubscribe();
    } else { // This case might not be strictly necessary if the component is only rendered for authenticated users
      setCart([]); // Clear cart if user logs out
    }
  }, [currentUser, setCart]);

  // Save cart data to Firestore whenever cart changes
  useEffect(() => {
    const saveCart = async () => {
      if (currentUser && cart) {
        const cartDocRef = doc(db, 'carts', currentUser.uid);
        await setDoc(cartDocRef, { items: cart });

      }
    }; saveCart();
  }, [cart, currentUser]); // Re-run effect if cart or user changes

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
