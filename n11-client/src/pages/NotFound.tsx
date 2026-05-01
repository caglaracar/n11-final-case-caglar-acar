import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-40">
        <h1 className="font-display text-6xl md:text-8xl text-primary-900 font-medium mb-4">404</h1>
        <p className="text-surface-500 text-base md:text-lg mb-8">Page not found</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
      <Footer />
    </div>
  );
}