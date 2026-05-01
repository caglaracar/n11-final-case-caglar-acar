import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { blogService } from '@/services';
import type { BlogPost } from '@/types/api';
import { blogPosts as mockBlog } from '@/mocks/products';

interface UiPost {
  id: string;
  slug?: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
}

function adapt(p: BlogPost): UiPost {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || '',
    content: p.content,
    category: p.category || 'Genel',
    image: p.image || '',
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
    readTime: p.readMinutes ? `${p.readMinutes} min read` : '',
  };
}

export default function BlogPage() {
  const [params] = useSearchParams();
  const slug = params.get('slug');
  const [posts, setPosts] = useState<UiPost[]>(mockBlog as unknown as UiPost[]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<UiPost | null>(null);

  useEffect(() => {
    let cancelled = false;
    blogService
      .findAll()
      .then((p) => {
        if (cancelled) return;
        if (p?.content?.length) setPosts(p.content.map(adapt));
      })
      .catch(() => {
        /* mock fallback */
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      setActive(null);
      return;
    }
    let cancelled = false;
    blogService
      .findBySlug(slug)
      .then((p) => !cancelled && setActive(adapt(p)))
      .catch(() => {
        if (cancelled) return;
        const fromList = posts.find((p) => p.slug === slug);
        setActive(fromList ?? null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const featured = posts[0];
  const rest = useMemo(() => posts.slice(1), [posts]);

  if (active) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 md:pt-36">
          <article className="section-padding py-12 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-medium text-accent-600 bg-accent-100 px-2.5 py-1 rounded-full">
                {active.category}
              </span>
              <span className="text-xs text-primary-400">{active.date}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-primary-900 font-medium mb-4">
              {active.title}
            </h1>
            {active.image && (
              <img
                src={active.image}
                alt={active.title}
                className="w-full rounded-xl mb-6 object-cover max-h-96"
              />
            )}
            <p className="text-primary-600 leading-relaxed whitespace-pre-line">
              {active.content || active.excerpt}
            </p>
          </article>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-32 md:pt-36">
        <div className="section-padding py-12 md:py-16 text-center border-b border-surface-100">
          <h1 className="font-display text-3xl md:text-4xl text-primary-900 font-medium mb-3">
            The LUXE Journal
          </h1>
          <p className="text-primary-500 max-w-lg mx-auto">
            Stories, guides, and inspiration from the world of premium living.
          </p>
        </div>

        {loading && (
          <div className="section-padding py-12 text-center text-sm text-primary-400">
            Yükleniyor...
          </div>
        )}

        {featured && (
          <div className="section-padding py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-surface-50 rounded-xl overflow-hidden border border-surface-200">
                <div className="h-64 md:h-80 overflow-hidden">
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 md:p-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-accent-600 bg-accent-100 px-2.5 py-1 rounded-full">
                      {featured.category}
                    </span>
                    <span className="text-xs text-primary-400">{featured.date}</span>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl text-primary-900 font-medium mb-3">
                    {featured.title}
                  </h2>
                  <p className="text-sm text-primary-500 leading-relaxed mb-4">{featured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-400">{featured.readTime}</span>
                    <button
                      onClick={() => setActive(featured)}
                      className="text-sm font-medium text-primary-800 hover:text-primary-600 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      Read More
                      <span className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-arrow-right-line"></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <div className="section-padding py-8 md:py-12">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-display text-xl text-primary-900 font-medium mb-8">Latest Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rest.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border border-surface-200 rounded-lg overflow-hidden group hover:border-primary-300 transition-colors"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-medium text-accent-600 bg-accent-100 px-2 py-0.5 rounded-full">
                          {post.category}
                        </span>
                        <span className="text-xs text-primary-400">{post.date}</span>
                      </div>
                      <h3 className="font-medium text-primary-900 mb-2 group-hover:text-primary-700 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-primary-400 leading-relaxed mb-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary-400">{post.readTime}</span>
                        <button
                          onClick={() => setActive(post)}
                          className="text-xs font-medium text-primary-800 hover:text-primary-600 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          Read More
                          <span className="w-3 h-3 flex items-center justify-center">
                            <i className="ri-arrow-right-line"></i>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
