import { Calendar, Clock, ArrowRight, Tag, Stethoscope } from 'lucide-react';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: 'Health Awareness' | 'Preventive Care' | 'Digital Health' | 'App Usage Guide' | string;
  content: string;
  coverImage: string;
  readTime: string;
  targetAudience: string[];
  publishedAt: string;
  author: string;
  // Doctor blog fields (optional)
  isDoctorBlog?: boolean;
  doctorName?: string;
  doctorSpecialty?: string;
}

interface BlogCardProps {
  post: BlogPost;
  onClick: (post: BlogPost) => void;
}

export function BlogCard({ post, onClick }: BlogCardProps) {
  const categoryColors: Record<string, string> = {
    'Health Awareness': 'bg-blue-100 text-blue-700',
    'Preventive Care': 'bg-green-100 text-green-700',
    'Digital Health': 'bg-purple-100 text-purple-700',
    'App Usage Guide': 'bg-amber-100 text-amber-700',
    'Women\'s Health': 'bg-pink-100 text-pink-700',
    'Child Health': 'bg-cyan-100 text-cyan-700',
    'Mental Wellness': 'bg-indigo-100 text-indigo-700',
    'Nutrition & Diet': 'bg-orange-100 text-orange-700',
    'Chronic Conditions': 'bg-red-100 text-red-700',
  };

  const authorName = post.author || post.doctorName || 'ORYGA';

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => onClick(post)}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-slate-200" />
        {post.coverImage ? (
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="relative w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="relative w-full h-full bg-gradient-to-br from-primary/10 via-blue-50 to-purple-50 flex items-center justify-center">
            <Stethoscope className="w-16 h-16 text-primary/20" />
          </div>
        )}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${categoryColors[post.category] || 'bg-slate-100 text-slate-700'}`}>
            {post.category}
          </span>
          {post.isDoctorBlog && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
              Doctor
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
          {post.shortDescription}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
             <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${post.isDoctorBlog ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                {authorName.charAt(0)}
             </div>
             <span className="text-xs font-medium text-slate-500">{authorName}</span>
          </div>
          <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Read Article <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}