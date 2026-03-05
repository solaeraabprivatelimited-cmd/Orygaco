import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function ContactUs() {
  const { navigate } = useAppNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Get in touch
          </h1>
          <p className="text-lg text-slate-600">
            Have questions about ORYGA? We're here to help. Our team is available 24/7 for emergencies and support.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Call Us</h3>
              <p className="text-sm text-slate-500 mb-4">Mon-Fri from 8am to 8pm.</p>
              <a href="tel:+917842030321" className="text-lg font-bold text-primary hover:underline">
                +91 7842030321
              </a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Email Us</h3>
              <p className="text-sm text-slate-500 mb-4">We'll respond within 24 hours.</p>
              <a href="mailto:support@oryga.com" className="text-slate-900 font-medium hover:text-primary transition-colors">
                support@oryga.com
              </a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Visit Us</h3>
              <p className="text-sm text-slate-500 mb-4">Headquarters</p>
              <p className="text-slate-900 font-medium">
                DLF Cyber City, Phase 2<br/>
                Gurugram, Haryana 122002
              </p>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Send us a message</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="John Doe" 
                        required 
                        value={formData.name}
                        onChange={handleChange}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="john@example.com" 
                        required 
                        value={formData.email}
                        onChange={handleChange}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      placeholder="How can we help?" 
                      required 
                      value={formData.subject}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows={6}
                      className="w-full min-h-[120px] rounded-xl border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                      placeholder="Tell us more about your inquiry..."
                      required
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                    {loading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
              <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Avg. response time: 2 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Shield className="w-4 h-4" />
                  <span>Secure & Encrypted</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    )
}