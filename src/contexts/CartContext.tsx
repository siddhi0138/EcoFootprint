import React, { useContext, useState, useEffect, createContext, ReactNode } from 'react';
import { db } from '@/firebase'; // Assuming '@/firebase' is the path to your Firebase initialization
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/contexts/UserDataContext'; // Assuming you want to award points for cart actions

interface CartItem {
  brand: any;
  id: string;
  quantity: number; 
  name: string; 
  price: number; 
  image?: string; // Make image optional initially
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
  const { addPoints } = useUserData(); // Assuming useUserData provides addPoints

  useEffect(() => {
    let unsubscribe: () => void;

    if (user && user.uid) {
      const userCartDocRef = doc(db, 'users', user.uid, 'cart', 'items');
      setLoadingCart(true); // Start loading

      unsubscribe = onSnapshot(userCartDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Ensure 'items' field exists and is an array
          if (data && Array.isArray(data.items)) {
            setCartItems(data.items as CartItem[]);
          } else {
            setCartItems([]);
          }
        } else {
          // Document doesn't exist, initialize with empty array
          setCartItems([]);
        }
        setLoadingCart(false); // Stop loading
      }, (error) => {
        console.error("Error fetching cart data:", error);
        setCartItems([]);
        setLoadingCart(false); // Stop loading on error
        toast({
          title: "Error loading cart",
          description: "Could not load your cart data.",
          variant: "destructive",
        });
      });
    } else {
      // Clear local state for unauthenticated users
      setCartItems([]);
      setLoadingCart(false); // Not loading if no user
    }

    return () => {
      // Unsubscribe when the component unmounts or user changes
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, toast]); // Depend on user and toast

  const getOrCreateCartDocRef = async (userId: string) => {
    const userCartCollectionRef = doc(db, 'users', userId, 'cart', 'items');
    const docSnap = await getDoc(userCartCollectionRef);

    if (!docSnap.exists()) {
      // Create the document if it doesn't exist
      await setDoc(userCartCollectionRef, { items: [] }, { merge: true });
    }
    return userCartCollectionRef;
  };


  const addToCart = async (product: {
    price: number; id: string; name: string; image?: string; brand?: string | null; // Added brand here
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
      const userCartDocRef = doc(db, 'users', user.uid, 'cart', 'items');
      const docSnap = await getDoc(userCartDocRef);
      let currentCartItems: CartItem[] = [];

      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        currentCartItems = docSnap.data().items as CartItem[];
      } else {
         // If document doesn't exist or items is not an array, initialize it.
         // This is a fallback, onSnapshot should ideally handle initial state.
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

      addPoints(10); // Award points for adding to cart
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
         // Should not happen if addToCart works, but as a safeguard
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
        // If quantity is 0 or less, remove the item instead
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
         // Safeguard
         await setDoc(userCartDocRef, { items: [] }, { merge: true });
        currentCartItems = [];
      }


      const existingItemIndex = currentCartItems.findIndex(item => item.id === productId);

      if (existingItemIndex > -1) {
        const updatedCart = [...currentCartItems];
        updatedCart[existingItemIndex].quantity = quantity;
 await setDoc(userCartDocRef, { items: updatedCart }, { merge: true });
         // No toast here, as quantity changes can be frequent and visual feedback is often enough
      } else {
         // Item not found in cart - this shouldn't happen if UI is synced with state
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
      const userCartDocRef = doc(db, 'users', user.uid, 'cart', 'items');
      // Set the items array to an empty array to clear the cart
      await setDoc(userCartDocRef, { items: [] }, { merge: true });

      // Optional: Award points for clearing cart (if that's a feature)
      // addPoints(somePoints);

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