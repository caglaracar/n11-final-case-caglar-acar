import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';

const values = [
  {
    icon: 'ri-shield-check-line',
    title: 'Quality First',
    desc: 'Every product is hand-picked and rigorously tested to meet our premium standards.',
  },
  {
    icon: 'ri-leaf-line',
    title: 'Sustainability',
    desc: 'We partner with eco-conscious brands and prioritize sustainable packaging.',
  },
  {
    icon: 'ri-customer-service-2-line',
    title: '24/7 Support',
    desc: 'Our dedicated team is always here to help, no matter the time or question.',
  },
  {
    icon: 'ri-truck-line',
    title: 'Fast Delivery',
    desc: 'Free shipping on orders over $100. Express options available worldwide.',
  },
];

const team = [
  { name: 'Alexandra Reed', role: 'Founder & CEO', img: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20headshot%20warm%20lighting%20minimal%20background%20elegant%20business%20attire&width=300&height=360&seq=team1&orientation=portrait' },
  { name: 'Marcus Chen', role: 'Head of Operations', img: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20headshot%20warm%20lighting%20minimal%20background%20elegant%20business%20attire&width=300&height=360&seq=team2&orientation=portrait' },
  { name: 'Sofia Martinez', role: 'Creative Director', img: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20headshot%20warm%20lighting%20minimal%20background%20elegant%20creative%20attire&width=300&height=360&seq=team3&orientation=portrait' },
  { name: 'James Okafor', role: 'Tech Lead', img: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20headshot%20warm%20lighting%20minimal%20background%20elegant%20casual%20attire&width=300&height=360&seq=team4&orientation=portrait' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 md:pt-36">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          <img
            src="https://readdy.ai/api/search-image?query=modern%20premium%20e-commerce%20warehouse%20fulfillment%20center%20organized%20shelves%20warm%20lighting%20minimal%20aesthetic%20editorial%20photography&width=1400&height=600&seq=about1&orientation=landscape"
            alt="About LUXE"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/40 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="section-padding pb-12 md:pb-16 w-full">
              <p className="text-accent-400 text-sm tracking-wider uppercase mb-2">Since 2019</p>
              <h1 className="font-display text-3xl md:text-5xl text-white font-medium max-w-2xl">
                Redefining Online Shopping
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl text-primary-900 font-medium mb-6">Our Story</h2>
          <p className="text-primary-500 leading-relaxed text-base md:text-lg mb-6">
            Sepetify, basit bir inanca dayanarak doğdu: herkes premium ürünlere erişebilmeli, karışık süreçler olmadan.
            What started as a curated selection of hand-picked items has grown into a global marketplace serving
            millions of customers across 50+ countries.
          </p>
          <p className="text-primary-500 leading-relaxed text-base md:text-lg">
            We do not just sell products — we curate experiences. Every item in our catalog is tested, reviewed,
            and approved by our team of experts. From cutting-edge electronics to sustainable fashion,
            we bring you the best the world has to offer.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding py-12 md:py-16 bg-surface-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '2M+', label: 'Happy Customers' },
            { value: '50+', label: 'Countries Served' },
            { value: '15K+', label: 'Products' },
            { value: '99.2%', label: 'Satisfaction Rate' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl font-semibold text-primary-900">{stat.value}</p>
              <p className="text-sm text-primary-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="section-padding py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl text-primary-900 font-medium text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-white border border-surface-200 rounded-lg p-6 text-center hover:border-primary-300 transition-colors">
                <span className="w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-800">
                  <i className={`${v.icon} text-3xl`}></i>
                </span>
                <h3 className="font-medium text-primary-900 mb-2">{v.title}</h3>
                <p className="text-sm text-primary-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding py-16 md:py-24 bg-surface-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl text-primary-900 font-medium text-center mb-12">Meet the Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map(member => (
              <div key={member.name} className="text-center">
                <div className="w-full aspect-[5/6] rounded-lg overflow-hidden mb-4">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover object-top" />
                </div>
                <h3 className="font-medium text-primary-900">{member.name}</h3>
                <p className="text-sm text-primary-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl text-primary-900 font-medium mb-4">Sepetify'a Katılmaya Hazır mısınız?</h2>
          <p className="text-primary-500 mb-8">Milyonlarca mutlu müşteriye katılın ve Sepetify’da premium ürünleri keşfedin.</p>
          <Link to="/products" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
