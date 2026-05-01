import { useState } from 'react';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { contactService } from '@/services';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.length > 500) e.message = 'Max 500 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      await contactService.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setServerError(err?.serverMessage || err?.message || 'Mesajınız gönderilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-32 md:pt-36">
        {/* Header */}
        <div className="section-padding py-12 md:py-16 text-center border-b border-surface-100">
          <h1 className="font-display text-3xl md:text-4xl text-primary-900 font-medium mb-3">Get in Touch</h1>
          <p className="text-primary-500 max-w-lg mx-auto">Have a question, feedback, or just want to say hello? We would love to hear from you.</p>
        </div>

        <div className="section-padding py-12 md:py-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="font-medium text-primary-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {[
                    { icon: 'ri-mail-line', label: 'Email', value: 'support@sepetify.com' },
                    { icon: 'ri-phone-line', label: 'Phone', value: '+1 (555) 123-4567' },
                    { icon: 'ri-map-pin-line', label: 'Address', value: '350 Fifth Avenue, New York, NY 10118' },
                    { icon: 'ri-time-line', label: 'Hours', value: 'Mon - Fri: 9AM - 6PM EST' },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="w-5 h-5 flex items-center justify-center text-primary-600 mt-0.5 flex-shrink-0">
                        <i className={`${item.icon} text-base`}></i>
                      </span>
                      <div>
                        <p className="text-xs text-primary-400 uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm text-primary-800">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-primary-900 mb-3">Follow Us</h3>
                <div className="flex items-center gap-3">
                  {['ri-instagram-line', 'ri-twitter-x-line', 'ri-facebook-line', 'ri-linkedin-line'].map(icon => (
                    <a key={icon} href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-surface-300 text-primary-600 hover:border-primary-800 hover:text-primary-900 transition-all">
                      <i className={`${icon} text-lg`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {sent ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <span className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-green-100 rounded-full text-green-600">
                    <i className="ri-check-line text-2xl"></i>
                  </span>
                  <h3 className="font-display text-xl text-primary-900 font-medium mb-2">Message Sent!</h3>
                  <p className="text-sm text-primary-500">Thank you for reaching out. We will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-surface-50 rounded-lg border border-surface-200 p-6 md:p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="John Doe"
                        className={`w-full px-4 py-3 rounded-md border text-sm text-primary-900 placeholder-primary-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-800/20 transition-all ${errors.name ? 'border-red-400' : 'border-surface-300 hover:border-primary-400'}`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="john@example.com"
                        className={`w-full px-4 py-3 rounded-md border text-sm text-primary-900 placeholder-primary-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-800/20 transition-all ${errors.email ? 'border-red-400' : 'border-surface-300 hover:border-primary-400'}`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="How can we help?"
                      className={`w-full px-4 py-3 rounded-md border text-sm text-primary-900 placeholder-primary-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-800/20 transition-all ${errors.subject ? 'border-red-400' : 'border-surface-300 hover:border-primary-400'}`}
                    />
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-700 uppercase tracking-wider mb-1.5">Message</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      maxLength={500}
                      className={`w-full px-4 py-3 rounded-md border text-sm text-primary-900 placeholder-primary-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-800/20 transition-all resize-none ${errors.message ? 'border-red-400' : 'border-surface-300 hover:border-primary-400'}`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
                      <p className="text-xs text-primary-400 ml-auto">{form.message.length}/500</p>
                    </div>
                  </div>
                  {serverError && (
                    <p className="text-red-500 text-sm">{serverError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? 'Gönderiliyor...' : 'Send Message'}
                    <span className="w-4 h-4 flex items-center justify-center"><i className="ri-send-plane-line"></i></span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
