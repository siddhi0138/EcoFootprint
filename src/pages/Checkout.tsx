import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '../components/ui/button';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { emailReceipt } from '../services/emailApi';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Minus, Trash2, Download, CheckCircle, Mail } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number | null;
  quantity: number;
  brand?: any;
}

const Checkout = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [confirmedOrder, setConfirmedOrder] = useState<OrderItem[] | null>(null);
  const [isEmailing, setIsEmailing] = useState(false);

  const totalPrice = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return sum + price * quantity;
  }, 0);

  const handleConfirmPurchase = () => {
    const order = cartItems.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity }));
    setConfirmedOrder(order);

    // Record a permanent order history entry before clearing the cart - otherwise the purchase
    // (what was bought, for how much, when) is lost entirely the moment the cart empties.
    if (currentUser) {
      addDoc(collection(db, 'users', currentUser.uid, 'orders'), {
        items: order,
        total: orderTotal(order),
        createdAt: serverTimestamp(),
      }).catch((error) => {
        console.error('Error saving order history:', error);
      });
    }

    clearCart();
  };

  const orderTotal = (order: OrderItem[]) =>
    order.reduce((sum, item) => sum + (typeof item.price === 'number' ? item.price * item.quantity : 0), 0);

  // Builds a real, formatted PDF receipt with jsPDF.
  const buildReceiptPdf = (order: OrderItem[]) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(16, 122, 87);
    doc.text('EcoScope', 20, 22);
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text('Order Receipt', 20, 30);
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 38);

    doc.setDrawColor(220, 220, 220);
    doc.line(20, 44, 190, 44);

    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    let y = 54;
    doc.text('Item', 20, y);
    doc.text('Qty', 130, y);
    doc.text('Amount', 165, y);
    y += 4;
    doc.line(20, y, 190, y);
    y += 8;

    order.forEach((item) => {
      const amount = typeof item.price === 'number' ? `$${(item.price * item.quantity).toFixed(2)}` : 'N/A';
      doc.text(String(item.name).slice(0, 60), 20, y);
      doc.text(String(item.quantity), 130, y);
      doc.text(amount, 165, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.line(20, y, 190, y);
    y += 8;
    doc.setFontSize(13);
    doc.setTextColor(16, 122, 87);
    doc.text(`Total: $${orderTotal(order).toFixed(2)}`, 130, y);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a demo order - no real payment was processed.', 20, 285);
    return doc;
  };

  const downloadReceipt = () => {
    if (!confirmedOrder) return;
    buildReceiptPdf(confirmedOrder).save(`ecoscope-receipt-${Date.now()}.pdf`);
  };

  // The app sends the receipt (with the same PDF attached) to the user's inbox via the backend's
  // dual-provider email service (Gmail API primary, Resend fallback).
  const emailReceiptToUser = async () => {
    if (!confirmedOrder) return;
    if (!currentUser?.email) {
      toast({ title: 'No email on file', description: 'Log in with an email to have your receipt sent.', variant: 'destructive' });
      return;
    }
    setIsEmailing(true);
    try {
      const fileName = `ecoscope-receipt-${Date.now()}.pdf`;
      const dataUri = buildReceiptPdf(confirmedOrder).output('datauristring');
      const attachmentBase64 = dataUri.split(',')[1];
      await emailReceipt({
        to_email: currentUser.email,
        items: confirmedOrder.map((i) => ({ name: i.name, quantity: i.quantity, price: typeof i.price === 'number' ? i.price : null })),
        total: orderTotal(confirmedOrder),
        order_date: new Date().toLocaleString(),
        attachment_base64: attachmentBase64,
        attachment_filename: fileName,
      });
      toast({ title: 'Receipt emailed', description: `A downloadable PDF was sent to ${currentUser.email}.` });
    } catch (err: any) {
      toast({
        title: "Couldn't email receipt",
        description: /configured/i.test(err?.message || '')
          ? "Email delivery isn't set up on the server yet. Your PDF download still works."
          : 'Something went wrong sending the email. Your PDF download still works.',
        variant: 'destructive',
      });
    } finally {
      setIsEmailing(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md dark:bg-slate-800 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Purchase Confirmed!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This is a placeholder checkout - no real payment was processed. Download your receipt as a PDF, or tap Email Receipt and the app will email it to your inbox.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={downloadReceipt} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={emailReceiptToUser} variant="outline" disabled={isEmailing}>
            <Mail className="w-4 h-4 mr-2" />
            {isEmailing ? 'Sending...' : 'Email Receipt'}
          </Button>
          <Button onClick={() => onNavigate('marketplace')} className="bg-emerald-600 hover:bg-emerald-700">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

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
