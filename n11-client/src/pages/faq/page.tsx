import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { faqData } from '@/mocks/products';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filtered = faqData.filter(f =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-32 md:pt-36">
        {/* Header */}
        <div className="section-padding py-12 md:py-16 text-center border-b border-surface-100">
          <h1 className="font-display text-3xl md:text-4xl text-primary-900 font-medium mb-3">Frequently Asked Questions</h1>
          <p className="text-primary-500 max-w-lg mx-auto mb-8">Find answers to common questions about orders, shipping, returns, and more.</p>
          <div className="max-w-md mx-auto relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-primary-400">
              <i className="ri-search-line text-base"></i>
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-11 pr-4 py-3 border border-surface-300 rounded-md text-sm text-primary-900 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-800/20 hover:border-primary-400 transition-all"
            />
          </div>
        </div>

        <div className="section-padding py-12 md:py-16">
          <div className="max-w-3xl mx-auto space-y-3">
            {filtered.map((faq, idx) => (
              <div key={idx} className="border border-surface-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-50 transition-colors cursor-pointer"
                >
                  <span className="font-medium text-primary-900 text-sm pr-4">{faq.question}</span>
                  <span className="w-5 h-5 flex items-center justify-center text-primary-400 flex-shrink-0">
                    {openIndex === idx
                      ? <i className="ri-subtract-line text-lg"></i>
                      : <i className="ri-add-line text-lg"></i>}
                  </span>
                </button>
                {openIndex === idx && (
                  <div className="px-6 pb-4 text-sm text-primary-500 leading-relaxed border-t border-surface-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <span className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-primary-300">
                  <i className="ri-question-line text-3xl"></i>
                </span>
                <p className="text-primary-500 text-sm">No questions found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Still need help */}
        <div className="section-padding py-12 md:py-16 bg-surface-50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-xl text-primary-900 font-medium mb-3">Still have questions?</h2>
            <p className="text-primary-500 text-sm mb-6">Our support team is here to help you with anything you need.</p>
            <Link to="/contact" className="btn-primary inline-block">Contact Support</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
