import { ArrowRight, BarChart3, Calendar, CheckCircle, Clock, Globe, Laptop, Shield, Stethoscope, Users, Zap, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

interface DoctorLandingPageProps {
  onNavigate: (view: string) => void;
}

export function DoctorLandingPage({ onNavigate }: DoctorLandingPageProps) {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Smart Workflow Automation",
      description: "Reduce administrative burden by 40%. Our AI handles scheduling, reminders, and follow-ups automatically.",
      color: "bg-blue-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Comprehensive Patient Profiles",
      description: "Access longitudinal patient history, lab results, and vitals in one unified, secure dashboard.",
      color: "bg-indigo-500"
    },
    {
      icon: <Laptop className="w-6 h-6" />,
      title: "HD Teleconsultation",
      description: "Seamless high-definition video consults with integrated prescription writing and notes taking.",
      color: "bg-violet-500"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Practice Analytics",
      description: "Real-time insights into your practice's performance, revenue, and patient retention rates.",
      color: "bg-sky-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bank-Grade Security",
      description: "HIPAA and ABDM compliant. Your data and your patients' data are encrypted and secure.",
      color: "bg-emerald-500"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Expand Your Reach",
      description: "Connect with patients across the country. Grow your practice beyond your physical clinic walls.",
      color: "bg-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500/20">
      
      {/* Abstract Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-400/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sky-400/10 to-blue-400/10 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-[16px] pt-[32px] pb-[80px] pr-[16px] pl-[16px]">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left z-10"
          >
            <Badge variant="outline" className="mb-6 border-blue-200 text-blue-700 bg-blue-50">
              For Healthcare Providers
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              The operating system for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-normal text-[40px]">modern medical practice.</span>
            </h1>

            <p className="text-xl text-slate-500 mb-8 font-light leading-relaxed max-w-lg">
              Elevate your practice with AI-powered tools, automated workflows, and a network that connects you to patients who need you most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="xl" 
                className="h-14 px-8 text-lg rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                onClick={() => onNavigate('auth-doctor')}
              >
                Login as Doctor<ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                className="h-14 px-8 text-lg rounded-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                onClick={() => onNavigate('about-us')}
              >
                <Play className="w-4 h-4 mr-2 fill-current" /> Watch Demo
              </Button>
            </div>
            
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Verified Partners</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>ABDM Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[600px] w-full hidden lg:flex items-center justify-center perspective-1000"
          >
            {/* Abstract Dashboard Visualization */}
            <div className="relative w-full h-full bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-6 overflow-hidden">
               {/* Decorative Gradient Blob */}
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
               
               {/* Sidebar Mock */}
               <div className="absolute left-6 top-6 bottom-6 w-20 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 flex flex-col items-center py-6 gap-6 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-transparent hover:bg-slate-100 flex items-center justify-center text-slate-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-transparent hover:bg-slate-100 flex items-center justify-center text-slate-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-transparent hover:bg-slate-100 flex items-center justify-center text-slate-400">
                    <BarChart3 className="w-6 h-6" />
                  </div>
               </div>

               {/* Main Content Area Mock */}
               <div className="absolute left-32 top-6 right-6 bottom-6 flex flex-col gap-6">
                  {/* Header */}
                  <div className="h-16 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-between px-6 shadow-sm">
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">Good Morning, Dr. Sarah</span>
                        <span className="text-xs text-slate-500">You have 8 appointments today</span>
                     </div>
                     <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100" />
                        <div className="w-8 h-8 rounded-full bg-slate-100" />
                     </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                     {[
                        { label: "Total Patients", val: "1,240", inc: "+12%", col: "bg-blue-50 text-blue-600" },
                        { label: "Appointments", val: "8", inc: "Today", col: "bg-indigo-50 text-indigo-600" },
                        { label: "Revenue", val: "₹45k", inc: "+8%", col: "bg-emerald-50 text-emerald-600" }
                     ].map((stat, i) => (
                        <div key={i} className="h-28 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-4 flex flex-col justify-between shadow-sm">
                           <div className="flex justify-between items-start">
                              <div className={cn("p-1.5 rounded-lg", stat.col)}>
                                 <BarChart3 className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{stat.inc}</span>
                           </div>
                           <div>
                              <div className="text-2xl font-bold text-slate-900">{stat.val}</div>
                              <div className="text-xs text-slate-500">{stat.label}</div>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* List Area */}
                  <div className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-4 shadow-sm relative overflow-hidden">
                     <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/80 to-transparent z-10" />
                     <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                           <div key={i} className="h-16 w-full bg-white/50 rounded-xl flex items-center px-4 gap-4 border border-white/60">
                              <div className="w-10 h-10 rounded-full bg-slate-200" />
                              <div className="flex-1">
                                 <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                                 <div className="h-3 w-20 bg-slate-100 rounded" />
                              </div>
                              <div className="h-8 w-20 bg-blue-50 rounded-lg" />
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to run your practice</h2>
            <p className="text-lg text-slate-500">A complete suite of tools designed to help you deliver better care, more efficiently.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-blue-200/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transition-transform group-hover:scale-110", feature.color)}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="grid md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
              <div className="p-4">
                 <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">10k+</div>
                 <div className="text-slate-400">Active Doctors</div>
              </div>
              <div className="p-4">
                 <div className="text-4xl md:text-5xl font-bold text-indigo-400 mb-2">2M+</div>
                 <div className="text-slate-400">Patient Records</div>
              </div>
              <div className="p-4">
                 <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">40%</div>
                 <div className="text-slate-400">Time Saved</div>
              </div>
              <div className="p-4">
                 <div className="text-4xl md:text-5xl font-bold text-sky-400 mb-2">50+</div>
                 <div className="text-slate-400">Cities Covered</div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">
            Ready to upgrade your practice?
          </h2>
          <p className="text-xl text-slate-500 mb-10">
             Join thousands of forward-thinking healthcare providers on ORYGA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="xl"
              className="h-14 px-10 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-lg shadow-xl hover:-translate-y-1 transition-all"
              onClick={() => onNavigate('auth-doctor-signup')}
            >
              Start Free Trial
            </Button>
            <Button 
              size="xl"
              variant="outline"
              className="h-14 px-10 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 text-lg"
              onClick={() => onNavigate('home')}
            >
              Go to Patient Site
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
