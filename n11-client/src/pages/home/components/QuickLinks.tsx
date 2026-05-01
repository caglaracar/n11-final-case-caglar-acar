import { Link } from 'react-router-dom';

const links = [
  {
    icon: 'ri-flashlight-line',
    label: 'Flash Deals',
    sub: 'Limited time',
    path: '/products',
    color: 'bg-accent-50 text-accent-600',
    border: 'border-accent-100',
  },
  {
    icon: 'ri-coupon-3-line',
    label: 'Coupons',
    sub: 'Save more',
    path: '/products',
    color: 'bg-rose-50 text-rose-500',
    border: 'border-rose-100',
  },
  {
    icon: 'ri-truck-line',
    label: 'Free Shipping',
    sub: 'Orders $100+',
    path: '/products',
    color: 'bg-teal-50 text-teal-600',
    border: 'border-teal-100',
  },
  {
    icon: 'ri-star-line',
    label: 'Best Sellers',
    sub: 'Top rated',
    path: '/products',
    color: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
  },
  {
    icon: 'ri-sparkling-line',
    label: 'New Arrivals',
    sub: 'Just landed',
    path: '/products',
    color: 'bg-green-50 text-green-600',
    border: 'border-green-100',
  },
  {
    icon: 'ri-leaf-line',
    label: 'Eco Picks',
    sub: 'Sustainable',
    path: '/products',
    color: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
  },
];

export default function QuickLinks() {
  return (
    <div className="bg-white border-b border-surface-200">
      <div className="section-padding py-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
          {links.map(link => (
            <Link
              key={link.label}
              to={link.path}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border ${link.border} ${link.color} hover:opacity-80 transition-all cursor-pointer`}
            >
              <span className="w-7 h-7 flex items-center justify-center">
                <i className={`${link.icon} text-2xl`}></i>
              </span>
              <span className="text-xs font-semibold leading-none text-center">{link.label}</span>
              <span className="text-[10px] text-primary-400 leading-none">{link.sub}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
