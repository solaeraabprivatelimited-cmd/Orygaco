import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Calendar, Share2, Facebook, Twitter, Linkedin, Copy, CheckCircle2 } from 'lucide-react';
import { BlogPost } from './BlogCard';
import { Button } from './ui/button';

interface BlogDetailPageProps {
  post: BlogPost | null; // Passed from navigation state usually
  onNavigate: (view: string) => void;
  onBack: () => void;
}

export function BlogDetailPage({ post, onNavigate, onBack }: BlogDetailPageProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  // If accessed directly via URL in a real app, we'd fetch by slug. 
  // Here we assume 'post' is passed. If null, we'd redirect or fetch.
  if (!post) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                  <h2 className="text-xl font-semibold">Article not found</h2>
                  <Button onClick={onBack} variant="link" className="mt-4">Back to Articles</Button>
              </div>
          </div>
      );
  }

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Dynamic CTA based on Category
  const getCTAContent = () => {
    switch(post.category) {
      case 'Digital Health':
        return {
          title: "Ready to digitize your health?",
          text: "Create your ABHA ID and link your records instantly on Oryga.",
          action: "Access Health Records",
          target: "health-records"
        };
      case 'Preventive Care':
        return {
          title: "Don't wait for symptoms.",
          text: "Book a preventive health checkup with top specialists today.",
          action: "Find a Doctor",
          target: "book-doctor"
        };
      case 'App Usage Guide':
        return {
          title: "Experience healthcare made simple.",
          text: "Try out these features in your dashboard now.",
          action: "Go to Dashboard",
          target: "patient-app"
        };
      default:
        return {
          title: "Take charge of your health.",
          text: "Connect with verified doctors and hospitals near you.",
          action: "Book Appointment",
          target: "book-doctor"
        };
    }
  };

  const cta = getCTAContent();

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Oryga Insights`;
    }
    return () => {
      document.title = 'Oryga - Healthcare Simplified';
    };
  }, [post]);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-300" style={{ width: `${scrollProgress * 100}%` }} />

      {/* Navigation Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 px-4 h-16 flex items-center justify-between max-w-7xl mx-auto w-full">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Articles
        </button>
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600">
                <Share2 className="w-4 h-4" />
            </Button>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* SECTION 1: HERO */}
        <header className="mb-12 text-center md:text-left">
          <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start mb-6">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase">
              {post.category}
            </span>
            <span className="flex items-center text-slate-500 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 mr-1" /> {post.readTime}
            </span>
            <span className="flex items-center text-slate-500 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 mr-1" /> {formattedDate}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center justify-center md:justify-start gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                {post.author.charAt(0)}
             </div>
             <div className="text-left">
                <div className="text-sm font-semibold text-slate-900">{post.author}</div>
                <div className="text-xs text-slate-500">Medical Reviewer</div>
             </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-16 shadow-2xl shadow-slate-200">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* SECTION 2: INTRO */}
        <div className="prose prose-lg prose-slate max-w-none mb-12">
           <p className="lead text-xl md:text-2xl text-slate-600 font-light leading-relaxed border-l-4 border-primary/20 pl-6 italic">
              {post.shortDescription}
           </p>
        </div>

        {/* SECTION 3 & 4: CORE CONTENT (Injected HTML) */}
        {/* We use a custom styling wrapper to enforce typography rules since prose might not be perfect */}
        <div 
          className="blog-content space-y-8 text-lg text-slate-700 leading-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <hr className="my-16 border-slate-100" />

        {/* SECTION 5: HOW APP HELPS */}
        <div className="bg-slate-50 rounded-2xl p-8 md:p-10 border border-slate-100 mb-12">
           <h3 className="text-2xl font-bold text-slate-900 mb-4">How Oryga Helps</h3>
           <p className="text-slate-600 mb-6 leading-relaxed">
             This isn't just theory. Our platform is designed to make managing {post.category.toLowerCase()} easier, accessible, and secure for you and your family.
           </p>
           <div className="flex items-start gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <p className="text-slate-700">Verified doctors and hospitals at your fingertips.</p>
           </div>
           <div className="flex items-start gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <p className="text-slate-700">Secure, encrypted digital health records (ABDM compliant).</p>
           </div>
           <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <p className="text-slate-700">Instant appointment booking without the queues.</p>
           </div>
        </div>

        {/* SECTION 6: ACTIONABLE TIPS (Simulated if not in content, or generic) */}
        {/* We assume specific tips are in content, but we add a generic "Next Steps" here */}
        
        {/* SECTION 7: CLOSING CTA */}
        <div className="text-center py-12">
           <h2 className="text-3xl font-bold text-slate-900 mb-4">{cta.title}</h2>
           <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">{cta.text}</p>
           <Button 
             size="lg" 
             className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
             onClick={() => onNavigate(cta.target)}
           >
             {cta.action}
           </Button>
        </div>
      </article>

      {/* Share / Footer */}
      <div className="max-w-3xl mx-auto px-4 mt-12 border-t border-slate-100 pt-8 flex justify-between items-center">
         <div className="text-sm text-slate-400">
            Published on Oryga Blog
         </div>
         <div className="flex gap-4">
            <button className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors">
               <Facebook className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-colors">
               <Twitter className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors">
               <Linkedin className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors" title="Copy Link">
               <Copy className="w-5 h-5" />
            </button>
         </div>
      </div>
      
      {/* CSS Injection for content typography since we can't use @tailwindcss/typography */}
      <style>{`
        .blog-content h2 {
          font-size: 1.875rem;
          line-height: 2.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
        }
        .blog-content h3 {
          font-size: 1.5rem;
          line-height: 2rem;
          font-weight: 600;
          color: #334155;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .blog-content p {
          margin-bottom: 1.5rem;
          color: #475569;
        }
        .blog-content ul {
          list-style-type: disc;
          padding-left: 1.625rem;
          margin-bottom: 1.5rem;
          color: #475569;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        .blog-content strong {
          color: #0f172a;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}