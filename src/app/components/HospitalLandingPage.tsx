import { ArrowRight, BarChart3, Building, CheckCircle, Clock, Database, Globe, LayoutDashboard, Shield, Stethoscope, Users, Zap, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

interface HospitalLandingPageProps {
  onNavigate: (view: string) => void;
}

export function HospitalLandingPage({ onNavigate }: HospitalLandingPageProps) {
  const features = [
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "Centralized Command Center",
      description: "Monitor OPD, IPD, and emergency departments in real-time from a single glass-pane dashboard.",
      color: "bg-emerald-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Staff & Resource Management",
      description: "Optimize doctor schedules, nursing shifts, and equipment utilization to reduce wait times.",
      color: "bg-teal-500"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Unified Patient Records",
      description: "ABDM-compliant digital health records that move seamlessly across departments.",
      color: "bg-cyan-500"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Financial Analytics",
      description: "Track revenue streams, insurance claims, and operational expenses with granular precision.",
      color: "bg-blue-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "ISO 27001 certified infrastructure ensuring your hospital data remains secure and private.",
      color: "bg-indigo-500"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Interconnected Network",
      description: "Seamlessly refer patients to specialists within the ORYGA network and expand your reach.",
      color: "bg-violet-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-500/20">
      
      {/* Abstract Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-400/10 to-emerald-400/10 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-[32px] pt-[32px] pb-[128px] pr-[32px] pl-[32px]">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left z-10"
          >
            <Badge variant="outline" className="mb-6 border-emerald-200 text-emerald-700 bg-emerald-50">
              For Hospital Administrators
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              The intelligent backbone for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 font-normal text-[40px]">future-ready hospitals.</span>
            </h1>

            <p className="text-xl text-slate-500 mb-8 font-light leading-relaxed max-w-lg">
              Streamline operations, enhance patient care, and drive growth with India's most advanced hospital management system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="xl" 
                className="h-14 px-8 text-lg rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                onClick={() => onNavigate('auth-hospital')}
              >
                Login for Hospitals <ArrowRight className="ml-2 w-5 h-5" />
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
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>NABL Accredited</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>NABH Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[600px] w-full hidden lg:flex items-center justify-center perspective-1000"
          >
            {/* Abstract Dashboard Visualization */}
            <div className="relative w-full h-full bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-6 overflow-hidden">
               {/* Decorative Gradient Blob */}
               <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />
               
               {/* Sidebar Mock */}
               <div className="absolute left-6 top-6 bottom-6 w-20 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 flex flex-col items-center py-6 gap-6 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white">
                    <Building className="w-6 h-6" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-transparent hover:bg-slate-100 flex items-center justify-center text-slate-400">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-transparent hover:bg-slate-100 flex items-center justify-center text-slate-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-transparent hover:bg-slate-100 flex items-center justify-center text-slate-400">
                    <Clock className="w-6 h-6" />
                  </div>
               </div>

               {/* Main Content Area Mock */}
               <div className="absolute left-32 top-6 right-6 bottom-6 flex flex-col gap-6">
                  {/* Header */}
                  <div className="h-16 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-between px-6 shadow-sm">
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">Tasneem Hospital - Hyderbad</span>
                        <span className="text-xs text-slate-500">Live Status: Optimal</span>
                     </div>
                     <div className="flex gap-2">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">OPD Active</Badge>
                     </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                     {[
                        { label: "Today's OPD", val: "482", inc: "+5%", col: "bg-emerald-50 text-emerald-600" },
                        { label: "Bed Occupancy", val: "87%", inc: "High", col: "bg-orange-50 text-orange-600" },
                        { label: "Active Staff", val: "142", inc: "On Duty", col: "bg-teal-50 text-teal-600" }
                     ].map((stat, i) => (
                        <div key={i} className="h-28 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-4 flex flex-col justify-between shadow-sm">
                           <div className="flex justify-between items-start">
                              <div className={cn("p-1.5 rounded-lg", stat.col)}>
                                 <BarChart3 className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-medium text-slate-500 bg-white/50 px-2 py-0.5 rounded-full">{stat.inc}</span>
                           </div>
                           <div>
                              <div className="text-2xl font-bold text-slate-900">{stat.val}</div>
                              <div className="text-xs text-slate-500">{stat.label}</div>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Graph Area */}
                  <div className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-4 shadow-sm relative overflow-hidden flex items-end justify-between px-8 pb-4 gap-2">
                     {[40, 65, 45, 80, 55, 70, 60, 90, 75, 50, 60, 85].map((h, i) => (
                       <div key={i} className="w-full bg-emerald-500/20 rounded-t-sm" style={{ height: `${h}%` }}>
                         <div className="w-full bg-emerald-500 rounded-t-sm transition-all duration-1000" style={{ height: `${h * 0.6}%` }} />
                       </div>
                     ))}
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Enterprise-grade hospital management</h2>
            <p className="text-lg text-slate-500">Scalable solutions designed for clinics, nursing homes, and multi-specialty hospitals.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-emerald-200/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transition-transform group-hover:scale-110", feature.color)}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">{feature.title}</h3>
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
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal-600/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="grid md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
              <div className="p-4">
                 <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">500+</div>
                 <div className="text-slate-400">Partner Hospitals</div>
              </div>
              <div className="p-4">
                 <div className="text-4xl md:text-5xl font-bold text-teal-400 mb-2">15k+</div>
                 <div className="text-slate-400">Beds Managed</div>
              </div>
              <div className="p-4">
                 <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">99.9%</div>
                 <div className="text-slate-400">Uptime SLA</div>
              </div>
              <div className="p-4">
                 <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">24/7</div>
                 <div className="text-slate-400">Critical Support</div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">
            Digitize your hospital today
          </h2>
          <p className="text-xl text-slate-500 mb-10">
             Join the network of leading healthcare institutions powered by ORYGA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="xl"
              className="h-14 px-10 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-lg shadow-xl hover:-translate-y-1 transition-all"
              onClick={() => onNavigate('auth-hospital-signup')}
            >
              Request Demo
            </Button>
            <Button 
              size="xl"
              variant="outline"
              className="h-14 px-10 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 text-lg"
              onClick={() => onNavigate('home')}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
