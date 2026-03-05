import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send, Eye, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface DoctorBlogEditorProps {
  onBack: () => void;
  blogId?: string | null;
}

export function DoctorBlogEditor({ onBack, blogId }: DoctorBlogEditorProps) {
  const [loading, setLoading] = useState(!!blogId);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successAction, setSuccessAction] = useState<'draft' | 'publish'>('publish');

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    category: 'Health Awareness',
    tags: [] as string[],
    content: '',
    coverImage: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  const categories = [
    'Health Awareness',
    'Preventive Care',
    'Digital Health',
    'Women\'s Health',
    'Child Health',
    'Mental Wellness',
    'Nutrition & Diet',
    'Chronic Conditions'
  ];

  useEffect(() => {
    if (blogId) {
      loadBlog();
    }
  }, [blogId]);

  const loadBlog = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/blogs/${blogId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        const blog = await response.json();
        setFormData({
          title: blog.title || '',
          shortDescription: blog.shortDescription || '',
          category: blog.category || 'Health Awareness',
          tags: blog.tags || [],
          content: blog.content || '',
          coverImage: blog.coverImage || ''
        });
      }
    } catch (error) {
      console.error('Failed to load blog:', error);
      toast.error('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const checkContent = (content: string) => {
    const newWarnings: string[] = [];
    
    // Check for medication names (simple pattern)
    if (/\b(tablet|capsule|medicine|drug|medication)\b/i.test(content)) {
      newWarnings.push('Detected medication references. Ensure you include proper disclaimers.');
    }

    // Check for diagnostic language
    if (/\b(diagnose|diagnosis|treatment|cure|prescribe)\b/i.test(content)) {
      newWarnings.push('Detected diagnostic language. Remember this is educational content only.');
    }

    // Check for minimum length
    if (content.length < 500) {
      newWarnings.push('Content is quite short. Consider adding more detail for better value.');
    }

    setWarnings(newWarnings);
  };

  const handleContentChange = (content: string) => {
    setFormData({ ...formData, content });
    checkContent(content);
  };

  const addTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
  };

  const saveDraft = async () => {
    if (!formData.title.trim()) {
      toast.error('Please add a title');
      return;
    }

    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in');
        return;
      }

      console.log('🔵 SAVE DRAFT - Starting save...', {
        blogId,
        title: formData.title,
        userRole: session.user.user_metadata?.role || session.user.app_metadata?.role
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/blogs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            authToken: session.access_token,
            id: blogId,
            ...formData,
            status: 'draft'
          })
        }
      );

      console.log('🔵 SAVE DRAFT - Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ SAVE DRAFT - Success:', result);
        toast.success('Draft saved successfully');
        setSuccessAction('draft');
        setShowSuccessDialog(true);
      } else {
        const error = await response.json();
        console.error('❌ SAVE DRAFT - Error:', error);
        toast.error(error.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('❌ SAVE DRAFT - Exception:', error);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  // PHASE 0: Immediate Publishing (Moderation-Ready Architecture)
  // When admin moderation is enabled, change status to 'pending'
  const publishBlog = async () => {
    if (!formData.title.trim() || !formData.shortDescription.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.content.length < 500) {
      toast.error('Content must be at least 500 characters');
      return;
    }

    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in');
        return;
      }

      console.log('🟢 PUBLISH BLOG - Starting publish...', {
        blogId,
        title: formData.title,
        userRole: session.user.user_metadata?.role || session.user.app_metadata?.role
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/blogs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            authToken: session.access_token,
            id: blogId,
            ...formData,
            status: 'published' // PHASE 0: Auto-publish (change to 'pending' when moderation enabled)
          })
        }
      );

      console.log('🟢 PUBLISH BLOG - Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ PUBLISH BLOG - Success:', result);
        toast.success('Blog published successfully! It\'s now live on your profile.');
        setSuccessAction('publish');
        setShowSuccessDialog(true);
        setTimeout(() => onBack(), 1500);
      } else {
        const error = await response.json();
        console.error('❌ PUBLISH BLOG - Error:', error);
        toast.error(error.error || 'Failed to publish blog');
      }
    } catch (error) {
      console.error('❌ PUBLISH BLOG - Exception:', error);
      toast.error('Failed to publish blog');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 px-4 h-16 flex items-center justify-between max-w-7xl mx-auto w-full">
          <button 
            onClick={() => setShowPreview(false)}
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Editor
          </button>
          <span className="text-sm font-medium text-slate-500">Preview Mode</span>
        </div>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <header className="mb-12 text-center md:text-left">
            <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start mb-6">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase">
                {formData.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              {formData.title || 'Your Blog Title'}
            </h1>

            <p className="text-xl text-slate-600 font-light leading-relaxed border-l-4 border-primary/20 pl-6 italic mb-6">
              {formData.shortDescription || 'Your short description...'}
            </p>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </header>

          <div className="blog-content space-y-8 text-lg text-slate-700 leading-8">
            <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br />') }} />
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
                disabled={!formData.title || !formData.content}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={saveDraft}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Draft
              </Button>

              <Button
                size="sm"
                onClick={publishBlog}
                disabled={saving}
                className="bg-primary text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warnings */}
        {warnings.length > 0 && (
          <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-2">Content Suggestions</h4>
                <ul className="space-y-1 text-sm text-amber-800">
                  {warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Disclaimer Notice */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>Auto-Disclaimer:</strong> A medical disclaimer will be automatically added to your published blog stating this is educational content only and not a substitute for professional medical advice.
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Blog Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="E.g., Understanding Type 2 Diabetes: A Complete Guide"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="text-lg font-medium"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Short Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="A brief summary of what readers will learn (150-250 characters)"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              rows={3}
              maxLength={250}
            />
            <p className="text-xs text-slate-500 mt-1">{formData.shortDescription.length}/250</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Tags (up to 5)
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add a tag (e.g., diabetes, prevention)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                disabled={formData.tags.length >= 5}
              />
              <Button onClick={addTag} variant="outline" disabled={formData.tags.length >= 5 || !tagInput.trim()}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="pl-3 pr-2 py-1.5">
                  {tag}
                  <button onClick={() => removeTag(i)} className="ml-2 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Blog Content <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Write your educational content here... Share your medical expertise in a way that empowers patients to make informed decisions."
              value={formData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={20}
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.content.length} characters • {Math.ceil(formData.content.split(/\s+/).length / 200)} min read
            </p>
          </div>

          {/* Cover Image URL (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Cover Image URL (Optional)
            </label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            />
          </div>
        </div>

        {/* Guidelines */}
        <Card className="p-6 mt-8 bg-slate-50 border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Content Guidelines</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Focus on education, not promotion or diagnosis</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Use clear, jargon-free language</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Cite credible sources when making medical claims</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Include a section on "When to Consult a Doctor"</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center">
              {successAction === 'draft' ? '✅ Draft Saved!' : '🎉 Blog Published!'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {successAction === 'draft' 
                ? 'Your draft has been saved successfully. You can continue editing or publish it later.' 
                : 'Your blog is now live on the Oryga Insights page and your doctor profile. Patients can start reading it immediately!'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                setShowSuccessDialog(false);
                if (successAction === 'publish') {
                  onBack();
                }
              }}
              className="w-full"
            >
              {successAction === 'draft' ? 'Continue Editing' : 'View My Blogs'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}