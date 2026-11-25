'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Zap,
  ShoppingBag,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  BatteryCharging,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Bot,
  Truck,
  Flame,
  Search,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPKR, apiFetch, getWhatsAppOrderUrl } from '../lib/api';

interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  brand_name: string;
  min_price: number;
  regular_price?: number;
  thumbnail: string;
  is_used: number;
  condition_grade?: string;
  pta_status?: string;
  battery_health?: number;
  default_variant_id?: string;
  default_storage?: string;
  default_color?: string;
  default_color_hex?: string;
  storages?: string[];
  colors?: string[];
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  products?: ProductCardData[];
  quickReplies?: string[];
  isCheckout?: boolean;
  checkoutProduct?: ProductCardData;
  isOrderSuccess?: boolean;
  orderInfo?: {
    orderNumber: string;
    total: number;
    phoneName: string;
    city: string;
    address: string;
    customerPhone: string;
    customerName: string;
  };
}

export default function ChatBot() {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Checkout Form State inside chat
  const [activeCheckoutProduct, setActiveCheckoutProduct] = useState<ProductCardData | null>(null);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutCity, setCheckoutCity] = useState('Karachi');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Assalam-o-Alaikum! 📱 Welcome to **CZNS Mobile Store**!\n\nMain aap ka **AI Shopping Assistant** hoon. Main aap ko best phone recommend karne aur **sirf 2 se 3 clicks** mein order book karwane mein madad karunga!\n\nAap ka budget kitna hai ya kaunsa mobile pasand hai?',
      quickReplies: [
        '⚡ Top Flagships',
        '💰 Under Rs. 35,000',
        '💵 Under Rs. 80,000',
        '👑 iPhone 17 Pro',
        '🔄 10/10 Used Phones',
        '📦 Nokia Keypad',
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping, activeCheckoutProduct]);

  // Handle Quick Reply Click
  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  // Send message to Bot API
  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      { id: userMsgId, sender: 'user', text },
    ];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/v1/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error('Failed to get bot reply');

      const data = await res.json();
      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Yeh rahe aap ke liye best smartphones:',
          products: data.products || [],
          quickReplies: data.quick_replies || [
            '⚡ Buy in 2 Clicks',
            '🔥 View Under 50k',
            '🚚 Karachi COD Details',
          ],
        },
      ]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'Shukriya! Aap direct hamare WhatsApp support ya Shop page se bhi order kar sakte hain. Karachi mein **Cash on Delivery (COD)** 100% available hai!',
          quickReplies: ['⚡ Top Recommendations', '💰 Under 50k Phones'],
        },
      ]);
    }
  };

  // STEP 1 OF 2-CLICK PURCHASE: User clicks "⚡ Buy in 2 Clicks"
  const start2ClickPurchase = (prod: ProductCardData) => {
    setActiveCheckoutProduct(prod);
    setSelectedStorage(prod.default_storage || prod.storages?.[0] || '128GB');
    setSelectedColor(prod.default_color || prod.colors?.[0] || 'Standard');
    setCheckoutError('');

    // Add in-chat prompt message
    setMessages((prev) => [
      ...prev,
      {
        id: `checkout-prompt-${Date.now()}`,
        sender: 'bot',
        text: `⚡ **2-Click Express Checkout:** Aap ne select kiya hai **${prod.name}**.\nSirf apna **Naam**, **WhatsApp Number** aur **Address** confirm karein, order foran book ho jayega:`,
        isCheckout: true,
        checkoutProduct: prod,
      },
    ]);
  };

  // Add to Bag from chat
  const handleAddToBag = (prod: ProductCardData) => {
    const storage = prod.default_storage || prod.storages?.[0] || '128GB';
    const color = prod.default_color || prod.colors?.[0] || 'Standard';
    const hex = prod.default_color_hex || '#333333';

    addToCart(
      {
        variant_id: prod.default_variant_id || `var-${prod.id}`,
        product_id: prod.id,
        product_name: prod.name,
        product_slug: prod.slug,
        storage,
        color_name: color,
        color_hex: hex,
        image_url: prod.thumbnail,
        price: prod.min_price,
        regular_price: prod.regular_price || prod.min_price,
        quantity: 1,
        is_used: prod.is_used,
        condition_grade: prod.condition_grade || (prod.is_used ? '10/10 Mint' : 'Brand New'),
        pta_status: prod.pta_status || 'Official PTA',
        battery_health: prod.battery_health || (prod.is_used ? 95 : 100),
        max_stock: 5,
      },
      true
    );

    setMessages((prev) => [
      ...prev,
      {
        id: `cart-added-${Date.now()}`,
        sender: 'bot',
        text: `✅ **${prod.name}** aap ke Bag mein add ho gaya hai! Aap yahan se 1-click mein direct checkout kar sakte hain ya baki shopping jari rakh sakte hain.`,
        quickReplies: ['⚡ Buy Now Directly', '🛍️ View Bag / Cart', 'Explore More Phones'],
      },
    ]);
  };

  // STEP 2 & 3 OF 2-CLICK PURCHASE: Confirm Order
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckoutProduct) return;

    if (!checkoutName.trim() || !checkoutPhone.trim() || !checkoutAddress.trim()) {
      setCheckoutError('Meherbani farma kar Naam, WhatsApp Number aur Address lazmi enter karein.');
      return;
    }

    setIsPlacingOrder(true);
    setCheckoutError('');

    const isKarachi = checkoutCity.toLowerCase() === 'karachi';
    const deliveryFee = isKarachi ? 250 : 0;
    const subtotal = activeCheckoutProduct.min_price;
    const grandTotal = subtotal + deliveryFee;

    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: checkoutName.trim(),
          customer_phone: checkoutPhone.trim(),
          address: checkoutAddress.trim(),
          city: checkoutCity,
          province: isKarachi ? 'Sindh' : 'Pakistan',
          payment_method: 'cod',
          items: [
            {
              variant_id: activeCheckoutProduct.default_variant_id || `var-${activeCheckoutProduct.id}`,
              quantity: 1,
            },
          ],
          notes: `Booked via CZNS 2-Click AI Assistant. Variant: ${selectedStorage} - ${selectedColor}`,
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to place order');
      }

      setIsPlacingOrder(false);
      const bookedOrderNum = orderData.order_number || `CZNS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Post Success Message in Chat
      setMessages((prev) => [
        ...prev,
        {
          id: `success-${Date.now()}`,
          sender: 'bot',
          text: `🎉 **Mubarak Ho! Aap ka order kamyabi se confirm ho gaya hai!**\n\n📌 **Order ID:** #${bookedOrderNum}\n📱 **Phone:** ${activeCheckoutProduct.name}\n💰 **Payable on Delivery:** ${formatPKR(grandTotal)}\n🚚 **Delivery Type:** ${isKarachi ? 'Karachi Cash on Delivery (24-48 Hours)' : 'Express Nationwide Shipping'}\n📍 **Deliver to:** ${checkoutAddress}, ${checkoutCity}`,
          isOrderSuccess: true,
          orderInfo: {
            orderNumber: bookedOrderNum,
            total: grandTotal,
            phoneName: activeCheckoutProduct.name,
            city: checkoutCity,
            address: checkoutAddress,
            customerPhone: checkoutPhone,
            customerName: checkoutName,
          },
          quickReplies: [
            '📦 Track This Order',
            '💬 WhatsApp Confirmation',
            '🔍 Browse More Phones',
          ],
        },
      ]);

      // Reset form
      setActiveCheckoutProduct(null);
      setCheckoutAddress('');
    } catch (err: any) {
      setIsPlacingOrder(false);
      setCheckoutError(err.message || 'Order process mein masla hua. Dobara koshish karein.');
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
        {/* Floating Callout Pill (Auto-highlights the 2-click buy capability, hidden on mobile) */}
        {!isOpen && hasUnread && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-xl border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] cursor-pointer hover:scale-105 transition-all group"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/chatbot-avatar.png"
                alt="AI Assistant"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold flex items-center gap-1" style={{ color: 'var(--primary-color, #10b981)' }}>
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              Buy in 2 Clicks
            </span>
            <span className="text-slate-500">| Chat Assistant</span>
          </motion.div>
        )}

        {/* Trigger Button featuring 3D Transparent Robot - STRICTLY SIZED FOR MOBILE & DESKTOP */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            backgroundColor: isOpen ? '#0f172a' : 'var(--primary-color, #10b981)',
            boxShadow: 'var(--primary-glow-lg, 0 12px 32px rgba(16,185,129,0.4))',
          }}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 aspect-square rounded-full flex items-center justify-center p-1.5 transition-all duration-300 cursor-pointer overflow-hidden ${
            isOpen ? 'rotate-90' : 'group'
          }`}
          aria-label="Open CZNS Shopping Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* 3D Transparent Robot Avatar strictly constrained */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/chatbot-avatar.png"
                alt="CZNS 3D AI Robot"
                className="w-10 h-10 sm:w-12 sm:h-12 max-w-full max-h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
              />
              {/* Online Pulse Dot */}
              <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full shadow-xs animate-pulse" />
            </div>
          )}
        </motion.button>
      </div>

      {/* CHATBOT MODAL / DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-x-3 bottom-20 sm:bottom-24 sm:right-5 sm:left-auto sm:w-[410px] h-[580px] max-h-[82vh] z-50 flex flex-col bg-white/92 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-[0_24px_65px_-12px_rgba(0,0,0,0.18)] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-2xl bg-white/95 border border-emerald-300 shadow-md flex items-center justify-center overflow-hidden p-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/chatbot-avatar.png"
                    alt="CZNS AI Sales Assistant"
                    className="w-full h-full object-contain filter drop-shadow-xs"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-1.5 leading-tight">
                    <span>CZNS AI Sales Assistant</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Live
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-200 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <span>Purchase in 2 to 3 Clicks • Karachi COD</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Reset button */}
                <button
                  onClick={() => {
                    setMessages([
                      {
                        id: `reset-${Date.now()}`,
                        sender: 'bot',
                        text: 'Chat reset ho chuki hai! Aap ka budget kitna hai ya kaunsa phone check karna chahte hain?',
                        quickReplies: [
                          '⚡ Top Flagships',
                          '💰 Under Rs. 35,000',
                          '💵 Under Rs. 80,000',
                          '👑 iPhone 17 Pro',
                          '🔄 10/10 Used Phones',
                          '📦 Nokia Keypad',
                        ],
                      },
                    ]);
                    setActiveCheckoutProduct(null);
                  }}
                  title="Reset Chat"
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Guarantee Micro-Bar */}
            <div className="bg-emerald-50/90 border-b border-emerald-100/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-emerald-900 font-semibold shrink-0">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                PTA Approved
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Karachi Cash on Delivery
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                7 Days Warranty
              </span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  } space-y-2`}
                >
                  {/* Message Bubble with Bot Avatar */}
                  <div
                    className={`flex items-start gap-2 max-w-[92%] ${
                      msg.sender === 'user' ? 'justify-end ml-auto' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-7 h-7 rounded-full bg-white/95 border border-emerald-300 shadow-xs flex items-center justify-center shrink-0 mt-0.5 overflow-hidden p-0.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/chatbot-avatar.png"
                          alt="AI Bot"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md rounded-br-xs font-medium'
                          : 'bg-white/90 border border-slate-200/80 text-slate-800 shadow-xs rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {/* RECOMMENDED PRODUCTS CAROUSEL / CARDS */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="w-full space-y-2.5 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                        Recommended Devices:
                      </div>
                      <div className="space-y-2.5">
                        {msg.products.map((prod) => {
                          const isUsed = prod.is_used === 1;
                          const discount =
                            prod.regular_price && prod.regular_price > prod.min_price
                              ? Math.round(
                                  ((prod.regular_price - prod.min_price) /
                                    prod.regular_price) *
                                    100
                                )
                              : 0;

                          return (
                            <div
                              key={prod.id}
                              className="bg-white/95 border border-slate-200 rounded-2xl p-3 shadow-xs hover:border-emerald-400 transition-all space-y-2.5"
                            >
                              <div className="flex gap-3">
                                {/* Thumbnail */}
                                <div className="relative w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={prod.thumbnail}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                        isUsed
                                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      }`}
                                    >
                                      {isUsed
                                        ? prod.condition_grade || '10/10 Mint'
                                        : 'Brand New'}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-500">
                                      {prod.brand_name}
                                    </span>
                                    {prod.battery_health && isUsed && (
                                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                        🔋 {prod.battery_health}%
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="font-bold text-slate-900 text-xs truncate mt-0.5">
                                    {prod.name}
                                  </h4>

                                  <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="font-black text-sm text-slate-950">
                                      {formatPKR(prod.min_price)}
                                    </span>
                                    {discount > 0 && prod.regular_price && (
                                      <span className="text-[10px] text-slate-400 line-through">
                                        {formatPKR(prod.regular_price)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* ACTIONS: 2-CLICK PURCHASE + ADD TO BAG + VIEW */}
                              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                                <button
                                  onClick={() => start2ClickPurchase(prod)}
                                  className="w-full py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95 group"
                                >
                                  <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                                  <span>Buy in 2 Clicks</span>
                                </button>

                                <button
                                  onClick={() => handleAddToBag(prod)}
                                  className="w-full py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                                >
                                  <ShoppingBag className="w-3 h-3 text-slate-600" />
                                  <span>Add to Bag</span>
                                </button>
                              </div>

                              <div className="flex justify-between items-center text-[10px] text-slate-500 px-0.5">
                                <span className="flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-emerald-600" />
                                  Karachi COD Available
                                </span>
                                <Link
                                  href={`/phone/${prod.slug}`}
                                  target="_blank"
                                  className="text-emerald-700 hover:underline font-bold flex items-center gap-0.5"
                                >
                                  <span>View 6 Angles</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* IN-CHAT 2-CLICK CHECKOUT CARD */}
                  {msg.isCheckout && msg.checkoutProduct && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border-2 border-emerald-500/80 rounded-2xl p-3.5 shadow-md space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
                          <Zap className="w-4 h-4 fill-emerald-500 text-emerald-600" />
                          <span>Express Checkout (Click 2 of 3)</span>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Cash On Delivery
                        </span>
                      </div>

                      {/* Phone Summary */}
                      <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.checkoutProduct.thumbnail}
                          alt={msg.checkoutProduct.name}
                          className="w-10 h-10 object-cover rounded-lg bg-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-slate-900 truncate">
                            {msg.checkoutProduct.name}
                          </div>
                          <div className="font-black text-xs text-emerald-700">
                            {formatPKR(msg.checkoutProduct.min_price)}
                          </div>
                        </div>
                      </div>

                      {/* Simple 3-Field Order Form */}
                      <form onSubmit={handleConfirmOrder} className="space-y-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Customer Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Muhammad Ali"
                            value={checkoutName}
                            onChange={(e) => setCheckoutName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            WhatsApp / Mobile Number *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 0300 1234567"
                            value={checkoutPhone}
                            onChange={(e) => setCheckoutPhone(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Delivery City *
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setCheckoutCity('Karachi')}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border text-center transition-all ${
                                checkoutCity === 'Karachi'
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              Karachi (COD Rs. 250)
                            </button>
                            <button
                              type="button"
                              onClick={() => setCheckoutCity('Lahore / Other')}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border text-center transition-all ${
                                checkoutCity !== 'Karachi'
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              Other City (TCS)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Complete House / Shop Address *
                          </label>
                          <textarea
                            required
                            rows={2}
                            placeholder="House / Flat No., Street, Area..."
                            value={checkoutAddress}
                            onChange={(e) => setCheckoutAddress(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                          />
                        </div>

                        {checkoutError && (
                          <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                            {checkoutError}
                          </div>
                        )}

                        {/* Order Calculation */}
                        <div className="bg-white/80 p-2 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                          <div className="flex justify-between text-slate-600">
                            <span>Phone Price:</span>
                            <span>{formatPKR(msg.checkoutProduct.min_price)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Delivery Fee:</span>
                            <span>{checkoutCity === 'Karachi' ? 'Rs. 250 (Karachi Rider)' : 'Rs. 0 (TCS Express)'}</span>
                          </div>
                          <div className="flex justify-between font-extrabold text-slate-950 pt-1 border-t border-slate-100 text-xs">
                            <span>Grand Total (COD):</span>
                            <span className="text-emerald-700">
                              {formatPKR(
                                msg.checkoutProduct.min_price +
                                  (checkoutCity === 'Karachi' ? 250 : 0)
                              )}
                            </span>
                          </div>
                        </div>

                        {/* CLICK 3: CONFIRM ORDER BUTTON */}
                        <button
                          type="submit"
                          disabled={isPlacingOrder}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isPlacingOrder ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Confirm & Place Order (Click 3)</span>
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* ORDER SUCCESS ACTIONS */}
                  {msg.isOrderSuccess && msg.orderInfo && (
                    <div className="w-full bg-white p-3 rounded-2xl border border-emerald-300 shadow-sm space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Order Officially Recorded in CZNS System</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href={`/track-order?order=${msg.orderInfo.orderNumber}`}
                          className="py-2 px-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold text-center hover:bg-emerald-600 transition-colors"
                        >
                          📦 Track Order
                        </Link>

                        <a
                          href={`https://wa.me/923001234567?text=Salam%20CZNS!%20Maine%20abhi%20order%20place%20kiya%20hai%20${msg.orderInfo.orderNumber}%20(${encodeURIComponent(msg.orderInfo.phoneName)})`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-bold text-center hover:bg-emerald-100 flex items-center justify-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* QUICK REPLIES */}
                  {msg.quickReplies && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickReply(q)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/90 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all shadow-2xs active:scale-95"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/95 border border-emerald-300 shadow-xs flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/chatbot-avatar.png"
                      alt="AI Bot"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200 p-2.5 rounded-2xl w-20 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="p-3 bg-white/95 border-t border-slate-200/80 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Ask about model, budget, or buy phone..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                style={{ backgroundColor: 'var(--primary-color, #10b981)' }}
                className="w-9 h-9 rounded-2xl hover:opacity-90 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
