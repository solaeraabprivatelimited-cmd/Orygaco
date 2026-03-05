import { useState, useEffect } from 'react';
import { Plus, FileText, CheckCircle, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { DoctorBlogEditor } from './DoctorBlogEditor';
import { useAppNavigate } from '../hooks/useAppNavigate';

interface Blog {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'unpublished';
  readTime: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  reviewNotes?: string;
}

interface DoctorBlogManagementProps {
}

export function DoctorBlogManagement() {
  const { goBack } = useAppNavigate();
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);

  useEffect(() => {
    if (view === 'list') {
      loadBlogs();
    }
  }, [view]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/blogs`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Failed to load blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fd75a5db/doctor/blogs/${blogId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        toast.success('Blog deleted');
        loadBlogs();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete blog');
    } finally {
      setDeletingBlogId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-700',
      published: 'bg-green-100 text-green-700',
    };

    const icons = {
      draft: <FileText className="w-3 h-3" />,
      published: <CheckCircle className="w-3 h-3" />,
    };

    return (
      <Badge className={`${styles[status as keyof typeof styles]} flex items-center gap-1.5`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredBlogs = blogs.filter((blog) => {
    if (activeTab === 'all') return true;
    return blog.status === activeTab;
  });

  // PHASE 0: Only show Draft and Published stats
  const stats = {
    total: blogs.length,
    draft: blogs.filter(b => b.status === 'draft').length,
    published: blogs.filter(b => b.status === 'published').length,
  };

  if (view === 'editor') {
    return (
      <DoctorBlogEditor 
        onBack={() => {
          setView('list');
          setEditingBlogId(null);
        }}
        blogId={editingBlogId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Blogs</h1>
              <p className="text-slate-600 mt-1">Share your medical expertise with patients</p>
            </div>
            <Button
              onClick={() => {
                setEditingBlogId(null);
                setView('editor');
              }}
              className="bg-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Blog
            </Button>
          </div>

          {/* Stats - PHASE 0: Only Total, Draft, and Published */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="p-4">
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-600">Total Blogs</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-slate-700">{stats.draft}</div>
              <div className="text-xs text-slate-600">Drafts</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-700">{stats.published}</div>
              <div className="text-xs text-slate-600">Published</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* PHASE 0: Only show All, Drafts, and Published tabs */}
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({stats.draft})</TabsTrigger>
            <TabsTrigger value="published">Published ({stats.published})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredBlogs.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No blogs yet</h3>
                <p className="text-slate-600 mb-6">
                  {activeTab === 'all' 
                    ? "Create your first blog to share your medical expertise with patients."
                    : `No blogs in ${activeTab} status.`
                  }
                </p>
                {activeTab === 'all' && (
                  <Button onClick={() => setView('editor')} className="bg-primary text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Blog
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <Card key={blog.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      {getStatusBadge(blog.status)}
                      <div className="flex items-center gap-2">
                        {blog.status !== 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingBlogId(blog.id);
                              setView('editor');
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {blog.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingBlogId(blog.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {blog.shortDescription}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span>{blog.category}</span>
                      <span>{blog.readTime}</span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Updated {new Date(blog.updatedAt).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Card - PHASE 0: Simplified messaging */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Blog Publishing Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Focus on education and empowerment, not diagnosis or treatment</li>
                <li>• Published blogs appear on your profile and the main Blogs page</li>
                <li>• Use clear, jargon-free language to make content accessible</li>
                <li>• Maintain professional medical standards and cite sources when needed</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBlogId} onOpenChange={(open) => !open && setDeletingBlogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The blog will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBlogId && handleDelete(deletingBlogId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}