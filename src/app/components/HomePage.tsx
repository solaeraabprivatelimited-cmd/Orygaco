import { Heart, Search, Hospital, Video, Shield, Activity, Clock, MapPin, Users, Star, CircleCheck, ArrowRight, Lock, FileCheck, Stethoscope } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import doctorHeroImage from 'figma:asset/41a844b33bd9b451dfff73880eb0e6924dbe37b0.png';
import { useAppNavigate } from '../hooks/useAppNavigate';

export function HomePage() {
  const { navigate } = useAppNavigate();
  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Doctor Matching",
      description: "AI-powered recommendations to find the right doctor for your needs"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Teleconsultation",
      description: "Connect with doctors from anywhere, anytime"
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Health Records",
      description: "Secure digital health records with ABDM integration"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Guardian Mode",
      description: "Manage health care for your family members remotely"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Emergency",
      description: "Instant access to emergency care and first responders"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Nationwide Network",
      description: "Access to doctors and hospitals across India"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Verified Doctors" },
    { value: "500+", label: "Partner Hospitals" },
    { value: "50+", label: "Cities Covered" },
    { value: "100K+", label: "Patients Served" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pr-[0px] pl-[0px] px-[0px] py-[24px]">
        {/* Animated Background Elements - Smoother, more organic motion */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <motion.div 
             animate={{ 
               scale: [1, 1.1, 1],
               opacity: [0.3, 0.5, 0.3],
               rotate: [0, 45, 0],
             }}
             transition={{ 
               duration: 20, 
               repeat: Infinity,
               ease: "linear" 
             }}
             className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] bg-gradient-to-br from-primary/10 to-blue-400/10 rounded-full blur-[120px]"
           />
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               opacity: [0.2, 0.4, 0.2],
               x: [0, -50, 0],
             }}
             transition={{ 
               duration: 25, 
               repeat: Infinity,
               ease: "linear",
             }}
             className="absolute top-[20%] -left-[20%] w-[600px] h-[600px] bg-purple-400/5 rounded-full blur-[100px]"
           />
           
           {/* Subtle Floating Hearts */}
           {[
             { top: '15%', left: '10%', delay: 0 },
             { top: '45%', right: '8%', delay: 2 },
             { bottom: '20%', left: '20%', delay: 4 },
             { top: '25%', right: '25%', delay: 1 },
             { bottom: '35%', right: '45%', delay: 3 },
             { top: '10%', right: '40%', delay: 5 },
           ].map((pos, i) => (
             <motion.div
               key={i}
               className="absolute text-pink-200/60"
               style={pos}
               animate={{
                 y: [0, -20, 0],
                 opacity: [0.3, 0.6, 0.3],
                 scale: [1, 1.2, 1],
               }}
               transition={{
                 duration: 4 + i,
                 repeat: Infinity,
                 ease: "easeInOut",
                 delay: pos.delay,
               }}
             >
               <Heart className="w-5 h-5 fill-current" />
             </motion.div>
           ))}
        </div>

        {/* Subtle Grainy Noise Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-darken"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10"
            >
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[rgb(229,40,94)] text-xs font-semibold uppercase tracking-wide"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  New Standard in Care
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                  Your Health, <br/>
                  <span className="text-[rgba(229,40,94,0.81)] bg-clip-text bg-gradient-to-r from-blue-600 to-[#E5285E] font-normal">
                    Reimagined.
                  </span>
                </h1>
                
                <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-light">
                  Experience a healthcare ecosystem built around you. Instant access to specialists, secure records, and personalized care plans.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="xl" 
                  className="h-14 px-8 rounded-full text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 bg-[rgb(229,40,94)] hover:bg-rose-700 transition-all hover:scale-105 active:scale-95"
                  onClick={() => navigate('book-doctor')}
                >
                  Find a Doctor
                </Button>
                <Button 
                  size="xl" 
                  variant="outline"
                  className="h-14 px-8 rounded-full text-base font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all bg-[rgba(250,250,250,0)]"
                  onClick={() => navigate('auth')}
                >
                  Login
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 flex items-center gap-6 text-sm font-medium text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>10k+ Doctors</span>
                </div>
              </div>
            </motion.div>

            {/* Interactive Stacked Cards Animation */}
            <motion.div 
               className="relative h-[600px] w-full flex items-center justify-center perspective-1000 group"
               initial="closed"
               whileHover="open"
               animate="closed"
            >
               {/* Card 3: Medical Records (Back) */}
               <motion.div
                 variants={{
                   closed: { rotate: -6, y: 0, x: 0, scale: 0.95, opacity: 0.6 },
                   open: { rotate: -12, y: 20, x: -60, scale: 0.95, opacity: 1 }
                 }}
                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
                 className="absolute w-[320px] h-[420px] bg-slate-50 rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col p-6 z-10"
               >
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                     <FileCheck className="w-5 h-5 text-purple-600" />
                   </div>
                   <div>
                     <div className="text-sm font-semibold text-slate-900">Lab Results</div>
                     <div className="text-xs text-slate-500">Latest report ready</div>
                   </div>
                 </div>
                 <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-2 bg-slate-100 rounded-full w-full" />
                    ))}
                    <div className="h-2 bg-slate-100 rounded-full w-2/3" />
                 </div>
                 <div className="mt-auto">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      View Report <ArrowRight className="w-3 h-3" />
                    </div>
                 </div>
               </motion.div>

               {/* Card 2: Vitals (Middle) */}
               <motion.div
                 variants={{
                   closed: { rotate: 3, y: 0, x: 0, scale: 0.98, opacity: 0.8 },
                   open: { rotate: 6, y: -20, x: 60, scale: 0.98, opacity: 1 }
                 }}
                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
                 className="absolute w-[320px] h-[420px] bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col p-6 z-20"
               >
                 <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                       <Activity className="w-5 h-5 text-rose-500" />
                     </div>
                     <div className="text-sm font-semibold text-slate-900">Heart Rate</div>
                   </div>
                   <Badge variant="outline" className="border-rose-100 text-rose-600 bg-rose-50/50">Live</Badge>
                 </div>
                 
                 <div className="text-center py-6">
                    <span className="text-6xl font-bold text-slate-900 tracking-tighter">72</span>
                    <span className="text-xl text-slate-400 font-medium ml-2">bpm</span>
                 </div>

                 {/* Simulated Graph */}
                 <div className="mt-auto h-24 flex items-end gap-1 justify-between px-2">
                    {[40, 60, 45, 70, 50, 80, 65, 55, 75, 60, 90, 50].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: '20%' }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
                        className="w-1.5 bg-rose-400/80 rounded-full" 
                      />
                    ))}
                 </div>
               </motion.div>

               {/* Card 1: Main Doctor (Front) */}
               <motion.div
                 variants={{
                   closed: { rotate: -2, y: 0 },
                   open: { rotate: 0, y: 0 }
                 }}
                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
                 className="absolute w-[340px] h-[460px] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] z-30 ring-1 ring-white/20"
               >
                 <img
                   src={https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80}
                   alt="Doctor"
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                 
                 {/* Glass Overlay Content */}
                 <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                   <div className="flex items-center justify-between mb-1">
                     <h3 className="text-xl font-bold">Dr. Tasneem </h3>
                     <div className="flex items-center gap-1 text-yellow-400">
                       <Star className="w-4 h-4 fill-current" />
                       <span className="text-sm font-bold">4.9</span>
                     </div>
                   </div>
                   <p className="text-slate-300 text-sm mb-4">Cardiologist • 7 yrs exp</p>
                   
                   <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     className="w-full py-3 bg-white text-slate-900 rounded-xl font-semibold text-sm shadow-lg hover:bg-primary hover:text-white transition-colors"
                     onClick={() => navigate('book-doctor')}
                   >
                     Book Appointment
                   </motion.button>
                 </div>
               </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-7">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-[1.1]"
              >
                Managing your health shouldn't feel like a <span className="text-muted-foreground/40 line-through decoration-primary/30">full-time job.</span>
              </motion.h2>
            </div>
            
            <div className="md:col-span-5 md:pt-4 space-y-8">
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-muted-foreground leading-relaxed font-light"
              >
                Scattered records. Endless queues. Confusing advice. The current system is broken.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pl-6 border-l-2 border-primary/20"
              >
                <p className="text-lg font-medium text-foreground">
                  ORYGA unifies your entire care journey into one simple, intelligent operating system.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-[64px] bg-slate-50/50 relative overflow-hidden px-[0px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
            >
              Simple steps to better care
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto font-light"
            >
              We've streamlined the healthcare experience so you can focus on what matters—getting better.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector line for desktop */}
            <div className="hidden md:block absolute top-[3rem] left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0" />

            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group cursor-default"
            >
              <div className="relative mb-8">
                {/* Ambient Glow */}
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
                
                {/* Icon Container */}
                <div className="relative w-28 h-28 bg-white rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center border border-white/50 ring-1 ring-black/5 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 ease-out z-10 overflow-hidden backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Search className="w-12 h-12 text-slate-900 group-hover:text-primary relative z-10 transition-all duration-500 group-hover:scale-110" strokeWidth={1.5} />
                </div>
                
                {/* Number Badge */}
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-base font-bold border-4 border-white shadow-lg z-20 group-hover:bg-primary transition-colors duration-300">
                  1
                </div>
              </div>
              
              <div className="space-y-3 relative z-10">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Search & Discover
                </h3>
                <p className="text-muted-foreground leading-relaxed px-2">
                   Find verified specialists, clinics, and hospitals near you. Filter by insurance, experience, and patient ratings.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative z-10 flex flex-col items-center text-center group cursor-default"
            >
              <div className="relative mb-8">
                {/* Ambient Glow */}
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
                
                {/* Icon Container */}
                <div className="relative w-28 h-28 bg-white rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center border border-white/50 ring-1 ring-black/5 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 ease-out z-10 overflow-hidden backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Clock className="w-12 h-12 text-slate-900 group-hover:text-primary relative z-10 transition-all duration-500 group-hover:scale-110" strokeWidth={1.5} />
                </div>
                
                {/* Number Badge */}
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-base font-bold border-4 border-white shadow-lg z-20 group-hover:bg-primary transition-colors duration-300">
                  2
                </div>
              </div>
              
              <div className="space-y-3 relative z-10">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Book Instantly
                </h3>
                <p className="text-muted-foreground leading-relaxed px-2">
                   View real-time availability and book appointments in seconds. No phone calls, no waiting on hold.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="relative z-10 flex flex-col items-center text-center group cursor-default"
            >
               <div className="relative mb-8">
                {/* Ambient Glow */}
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
                
                {/* Icon Container */}
                <div className="relative w-28 h-28 bg-white rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center border border-white/50 ring-1 ring-black/5 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 ease-out z-10 overflow-hidden backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CircleCheck className="w-12 h-12 text-slate-900 group-hover:text-primary relative z-10 transition-all duration-500 group-hover:scale-110" strokeWidth={1.5} />
                </div>
                
                {/* Number Badge */}
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-base font-bold border-4 border-white shadow-lg z-20 group-hover:bg-primary transition-colors duration-300">
                  3
                </div>
              </div>
              
              <div className="space-y-3 relative z-10">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  Get Care
                </h3>
                <p className="text-muted-foreground leading-relaxed px-2">
                   Consult in-person or online. Receive digital prescriptions, lab reports, and follow-up plans automatically.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-[68px] md:py-32 bg-slate-50 relative overflow-hidden px-[0px]">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 mb-16 md:mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900"
            >
              A complete <span className="text-primary">healthcare ecosystem.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Everything you need to manage your well-being, unified in one powerful platform.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="group h-full p-8 bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-6 inline-flex p-4 rounded-2xl bg-slate-50 text-slate-900 group-hover:bg-primary group-hover:text-white transition-colors duration-300 w-fit">
                      <div className="w-8 h-8">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-slate-500 leading-relaxed font-normal">
                      {feature.description}
                    </p>

                    {/* Arrow hint on hover */}
                    <div className="mt-auto pt-6 flex items-center text-primary font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Learn more <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section - REDESIGNED (Clean/Light) */}
      <section className="py-[68px] md:py-32 bg-slate-50 relative overflow-hidden px-[0px]">
        {/* Subtle Background Mesh */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
           <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl mix-blend-multiply" />
           <div className="absolute bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl mix-blend-multiply" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
                <Shield className="w-4 h-4 text-primary" />
                <span>Enterprise Grade Security</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 leading-[1.1]">
                Your privacy isn't just a feature. <br/>
                <span className="text-primary">It's our foundation.</span>
              </h2>
              
              <p className="text-xl text-slate-500 leading-relaxed font-light">
                We use the same encryption standards as leading banks. Your health data is yours alone—encrypted, private, and secure by default.
              </p>

              <div className="grid gap-6">
                {[
                  { 
                    icon: Shield, 
                    title: "ABDM Compliant", 
                    desc: "Seamlessly integrated with India's National Digital Health Ecosystem." 
                  },
                  { 
                    icon: Lock, 
                    title: "End-to-End Encryption", 
                    desc: "256-bit encryption ensures your records are readable only by you." 
                  },
                  { 
                    icon: FileCheck, 
                    title: "Strict Verification", 
                    desc: "Every practitioner is verified against national medical registries." 
                  }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex gap-5 items-start group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                      <item.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
              >
                {/* Visual Representation */}
                <div className="relative aspect-[4/5] md:aspect-square bg-white rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
                   {/* Abstract background inside card */}
                   <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/50" />
                   
                   {/* Grid Pattern */}
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

                   {/* Central "Vault" Illustration */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-64 h-64">
                         {/* Rings */}
                         <div className="absolute inset-0 border-2 border-primary/10 rounded-full animate-[spin_20s_linear_infinite]" />
                         <div className="absolute inset-8 border-2 border-dashed border-primary/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                         
                         {/* Center Shield */}
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 bg-primary text-white rounded-[2rem] shadow-2xl shadow-primary/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                               <Shield className="w-16 h-16" strokeWidth={1.5} />
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Floating "Notification" Cards */}
                   <motion.div 
                     animate={{ y: [-10, 10, -10] }}
                     transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute bottom-16 right-8 bg-white/80 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-xl max-w-[200px]"
                   >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Status</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">Encryption Active</div>
                   </motion.div>

                   <motion.div 
                     animate={{ y: [10, -10, 10] }}
                     transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                     className="absolute top-16 left-8 bg-white/80 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-xl flex items-center gap-3"
                   >
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                        <CircleCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Data Verified</div>
                        <div className="text-xs text-slate-500">ABDM Sync Complete</div>
                      </div>
                   </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left scale-110" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Ready to take control of <br/>your health?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of patients who trust ORYGA for their health needs. Experience the difference today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl" 
                className="text-lg h-14 px-8 shadow-xl shadow-primary/25 rounded-full"
                onClick={() => navigate('book-doctor')}
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                className="text-lg h-14 px-8 rounded-full border-2"
                onClick={() => navigate('features')}
              >
                Learn More
              </Button>
            </div>
        </div>
      </section>
    </div>
  );
}
