import React, { useContext, useState, useEffect, createContext, ReactNode } from 'react';
import { db } from '@/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/contexts/UserDataContext'; 

interface CartItem {
  brand: any;
  id: string;
  quantity: number; 
  name: string; 
  price: number; 
  image?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: { id: string; name: string; price?: number; image?: string; brand?: string | null }) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadingCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { addPoints } = useUserData(); 

  useEffect(() => {
    let unsubscribe: () => void;

    if (user && user.uid) {
      console.log(`Subscribing to cart for user ${user.uid}`);
      const userCartDocRef = doc(db, 'users', user.uid, 'cart', 'items');
      setLoadingCart(true); 

      unsubscribe = onSnapshot(userCartDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Cart data received:', data);
          if (data && Array.isArray(data.items)) {
            setCartItems(data.items as CartItem[]);
          } else {
            setCartItems([]);
          }
        } else {
          console.log('Cart document does not exist, initializing empty cart');
          setCartItems([]);
        }
        setLoadingCart(false); 
      }, (error) => {
        console.error("Error fetching cart data:", error);
        setCartItems([]);
        setLoadingCart(false); 
        toast({
          title: "Error loading cart",
          description: "Could not load your cart data.",
          variant: "destructive",
        });
      });
    } else {
      console.log('No user logged in, clearing cart');
      setCartItems([]);
      setLoadingCart(false);
    }

    return () => {
      if (unsubscribe) {
        console.log('Unsubscribing from cart');
        unsubscribe();
      }
    };
  }, [user, toast]); 

  const getOrCreateCartDocRef = async (userId: string) => {
    const userCartCollectionRef = doc(db, 'users', userId, 'cart', 'items');
    const docSnap = await getDoc(userCartCollectionRef);

    if (!docSnap.exists()) {
      await setDoc(userCartCollectionRef, { items: [] }, { merge: true });
    }
    return userCartCollectionRef;
  };


  const addToCart = async (product: {
    price: number; id: string; name: string; image?: string; brand?: string | null; 
}) => {
    if (!user || !user.uid) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`Adding product ${product.id} to cart for user ${user.uid}`);
      const userCartDocRef = doc(db, 'users', user.uid, 'cart', 'items');
      const docSnap = await getDoc(userCartDocRef);
      let currentCartItems: CartItem[] = [];

      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        currentCartItems = docSnap.data().items as CartItem[];
      } else {
         console.log('Cart document does not exist or items field missing, initializing empty cart');
         await setDoc(userCartDocRef, { items: [] }, { merge: true });
         currentCartItems = [];
      }

      const existingItemIndex = currentCartItems.findIndex(item => item.id === product.id);

      let updatedCart: CartItem[];
      if (existingItemIndex > -1) {
        updatedCart = [...currentCartItems];
        updatedCart[existingItemIndex].quantity += 1;
      } else {
        updatedCart = [...currentCartItems, { id: product.id, quantity: 1, name: product.name, price: product.price, image: product.image, brand: null }];
      }

      await setDoc(userCartDocRef, { items: updatedCart }, { merge: true });
      console.log('Cart updated successfully');

      addPoints(10); 
      toast({
        title: "Added to Cart!",
        description: `${product.name} added to cart. You earned 10 points!`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error adding to cart",
        description: "Could not add the product to your cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user || !user.uid) {
      toast({
        title: "Login Required",
        description: "Please log in to manage your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userCartDocRef = doc(db, 'users', user.uid, 'cart', 'items');
       const docSnap = await getDoc(userCartDocRef);
      let currentCartItems: CartItem[] = [];

      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        currentCartItems = docSnap.data().items as CartItem[];
      } else {
         await updateDoc(userCartDocRef, { items: [] });
        currentCartItems = [];
      }


      const updatedCart = currentCartItems.filter(item => item.id !== productId);

      await setDoc(userCartDocRef, { items: updatedCart }, { merge: true });

     toast({
        title: "Removed from Cart",
        description: "Product removed from your cart.",
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error removing from cart",
        description: "Could not remove the product from your cart. Please try again.",
        variant: "destructive",
      });
    }
  };

   const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || !user.uid) {
      toast({
        title: "Login Required",
        description: "Please log in to update your cart.",
        variant: "destructive",
      });
      return;
    }

     if (quantity <= 0) {
        removeFromCart(productId);
        return;
     }

    try {
      const userCartDocRef = doc(db, 'users', user.uid, 'cart', 'items');
       const docSnap = await getDoc(userCartDocRef);
      let currentCartItems: CartItem[] = [];

      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        currentCartItems = docSnap.data().items as CartItem[];
      } else {
         await setDoc(userCartDocRef, { items: [] }, { merge: true });
        currentCartItems = [];
      }


      const existingItemIndex = currentCartItems.findIndex(item => item.id === productId);

      if (existingItemIndex > -1) {
        const updatedCart = [...currentCartItems];
        updatedCart[existingItemIndex].quantity = quantity;
 await setDoc(userCartDocRef, { items: updatedCart }, { merge: true });
         
      } else {
        
         console.warn(`Attempted to update quantity for product ${productId} not found in cart.`);
      }


    } catch (error) {
      console.error("Error updating quantity:", error);
       toast({
        title: "Error updating quantity",
        description: "Could not update the product quantity. Please try again.",
        variant: "destructive",
      });
    }
   };

  const clearCart = async () => {
    if (!user || !user.uid) {
      toast({
        title: "Login Required",
        description: "Please log in to clear your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`Clearing cart for user ${user.uid}`);
      const userCartDocRef = doc(db, 'users', user.uid, 'cart', 'items');
     
      await setDoc(userCartDocRef, { items: [] }, { merge: true });
      console.log('Cart cleared successfully');

      

      toast({
        title: "Cart Cleared",
        description: "Your shopping cart has been cleared.",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error clearing cart",
        description: "Could not clear your cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, loadingCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};