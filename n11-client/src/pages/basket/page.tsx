import { Link } from 'react-router-dom';
import { useBasket } from '@/providers';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';

export default function BasketPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useBasket();

  const shipping = totalPrice > 100 ? 0 : 12.99;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-32">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-surface-100 mb-6">
            <i className="ri-shopping-cart-line text-3xl text-primary-400"></i>
          </div>
          <h1 className="font-display text-2xl md:text-3xl text-primary-900 font-bold mb-3">Your Cart is Empty</h1>
          <p className="text-primary-400 text-sm mb-8 max-w-sm text-center">
            Looks like you have not added anything yet. Explore our products and find something you love.
          </p>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <div className="pt-32 md:pt-36">
        <div className="section-padding py-8 md:py-12">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-primary-900 mb-8">Shopping Cart ({totalItems})</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-white rounded-xl border border-surface-200">
                  <Link to={`/product/${item.id}`} className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 overflow-hidden rounded-lg bg-surface-50">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-accent-500 font-semibold mb-0.5">{item.category}</p>
                      <Link to={`/product/${item.id}`} className="text-sm font-semibold text-primary-900 hover:text-accent-500 transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-base font-bold text-accent-500 mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-surface-300 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-surface-100 transition-colors cursor-pointer">
                          <i className="ri-subtract-line text-sm"></i>
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-primary-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-surface-100 transition-colors cursor-pointer">
                          <i className="ri-add-line text-sm"></i>
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-primary-300 hover:text-red-500 transition-colors cursor-pointer">
                        <i className="ri-delete-bin-line text-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-surface-200 p-6 sticky top-40">
                <h2 className="font-display font-bold text-lg text-primary-900 mb-5">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-500">Subtotal</span>
                    <span className="font-semibold text-primary-900">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-500">Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-primary-900'}`}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-500">Tax (8%)</span>
                    <span className="font-semibold text-primary-900">${tax.toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t border-surface-200 pt-4 mb-5">
                  <div className="flex justify-between">
                    <span className="font-bold text-primary-900">Total</span>
                    <span className="font-bold text-accent-500 text-xl">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Link to="/checkout" className="btn-primary block text-center w-full text-sm">
                  Proceed to Checkout
                </Link>
                <Link to="/products" className="block text-center text-sm text-primary-400 hover:text-primary-700 transition-colors mt-3">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
