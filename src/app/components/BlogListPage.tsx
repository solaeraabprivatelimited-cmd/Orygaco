import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { BlogCard, BlogPost } from './BlogCard';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Button } from './ui/button';

interface BlogListPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export function BlogListPage({ onNavigate }: BlogListPageProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Include both generic and doctor blog categories
  const categories = [
    'All', 
    'Health Awareness', 
    'Preventive Care', 
    'Digital Health', 
    'Women\'s Health',
    'Child Health',
    'Mental Wellness',
    'Nutrition & Diet',
    'Chronic Conditions',
    'App Usage Guide'
  ];

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        
        // Fetch both generic blogs and doctor-written blogs in parallel
        const [genericBlogsRes, doctorBlogsRes] = await Promise.all([
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/blogs`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          }),
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/public/doctor-blogs`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          })
        ]);
        
        const genericBlogs = genericBlogsRes.ok ? await genericBlogsRes.json() : [];
        const doctorBlogs = doctorBlogsRes.ok ? await doctorBlogsRes.json() : [];
        
        // Merge both types of blogs and sort by publishedAt/createdAt
        const allBlogs = [...genericBlogs, ...doctorBlogs].sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt).getTime();
          return dateB - dateA; // Newest first
        });
        
        setBlogs(allBlogs);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-[32px] py-[64px] pt-[32px] pr-[32px] pb-[64px] pl-[32px]">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6"
            >
              <BookOpen className="w-4 h-4" />
              <span>Health & App Insights</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6"
            >
              Better Health Starts with <br /> 
              <span className="text-primary">Better Knowledge.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-600 leading-relaxed max-w-2xl"
            >
              Expert insights on preventive care, digital health trends, and guides to help you get the most out of your Oryga experience.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Categories (Desktop) */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar max-w-2xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Categories (Mobile) */}
          <div className="md:hidden w-full overflow-x-auto pb-2 flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1, 2, 3].map(i => (
               <div key={i} className="bg-white h-96 rounded-2xl animate-pulse border border-slate-100">
                  <div className="h-56 bg-slate-200 rounded-t-2xl" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-slate-200 w-1/3 rounded" />
                    <div className="h-6 bg-slate-200 w-3/4 rounded" />
                    <div className="h-4 bg-slate-200 w-full rounded" />
                    <div className="h-4 bg-slate-200 w-full rounded" />
                  </div>
               </div>
             ))}
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((post) => (
              <BlogCard 
                key={post.id} 
                post={post} 
                onClick={(p) => onNavigate('blog-detail', p)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No articles found</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2">
              We couldn't find any articles matching your search. Try adjusting your filters.
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Newsletter / CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-center md:text-left relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-white mb-4">Stay updated with the latest in Health Tech</h2>
              <p className="text-slate-400 text-lg">
                Join our community to get weekly insights on preventive care and digital health trends directly in your app.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
               <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg text-base">
                  Subscribe to Newsletter
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}