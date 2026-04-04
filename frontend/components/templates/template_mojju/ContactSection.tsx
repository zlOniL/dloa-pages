'use client';
import { useState } from 'react';

interface ContactContent {
  title?: string;
  subtitle?: string;
}

export function ContactSection({ content }: { content: ContactContent }) {
  const {
    title    = 'Ready to Light Up the Screen?',
    subtitle = "Tell us about your project and we'll get back to you with a plan to bring your vision to cinematic reality",
  } = content ?? {};

  const [form, setForm]           = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]             = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSent(true); }, 1000);
  };

  return (
    <section id="contact" className="relative py-32 bg-gray-50 w-full">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#059669' }} />
            <span className="text-sm font-semibold text-gray-500">Let's Create Together</span>
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#2563eb' }} />
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8 text-gray-900">{title}</h2>
          <p className="text-2xl lg:text-3xl text-gray-500 max-w-4xl mx-auto leading-relaxed">{subtitle}</p>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-md">
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-1">Get In Touch</h3>
                <p className="text-gray-500">Fill out the form and we'll respond within 24 hours</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#059669' }} />
                <span className="text-sm text-gray-500 font-medium">Available now</span>
              </div>
            </div>

            {sent ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(5,150,105,0.1)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-2">Message sent!</h4>
                <p className="text-gray-500">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Name</label>
                    <input
                      type="text" maxLength={100} value={form.name} placeholder="Your name"
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': 'rgba(37,99,235,0.4)' } as any}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                    <input
                      type="email" maxLength={255} value={form.email} placeholder="your@email.com"
                      onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Message</label>
                  <textarea
                    rows={5} maxLength={1000} value={form.message} placeholder="Tell us about your project..."
                    onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="w-full py-4 rounded-xl font-black text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: '#0a0a0a', color: '#fafafa' }}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div className="text-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { color: '#2563eb', title: 'Project Discussion', desc: 'Share your vision and requirements with our team' },
              { color: '#059669', title: 'Custom Strategy',    desc: 'Get a tailored approach for your unique project' },
              { color: '#7c3aed', title: 'Next Steps',         desc: 'Clear timeline and roadmap to bring your idea to life' },
            ].map(({ color, title, desc }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${color}1a` }}>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <h4 className="font-black text-gray-900 mb-2">{title}</h4>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
