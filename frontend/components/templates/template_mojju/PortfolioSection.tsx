interface PortfolioContent {
  embedUrl?: string;
  projectTitle?: string;
  projectDescription?: string;
  industry?: string;
  style?: string;
  tone?: string;
  format?: string;
}

export function PortfolioSection({ content }: { content: PortfolioContent }) {
  const {
    embedUrl           = 'https://www.youtube.com/embed/fIbDWDh6aYw?rel=0&showinfo=0&modestbranding=1',
    projectTitle       = 'The Lonely Journey',
    projectDescription = 'A powerful commercial exploring the isolation that startup founders face and how joining the community can transform that journey. This piece captures the emotional weight of entrepreneurship and the relief that comes with finding your tribe.',
    industry           = 'Community Platform',
    style              = 'Narrative Drama',
    tone               = 'Emotional Journey',
    format             = 'Digital Commercial',
  } = content ?? {};

  return (
    <section id="portfolio" className="relative py-32 bg-white w-full">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">

        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#059669' }} />
            <span className="text-sm font-semibold text-gray-500">Featured Work</span>
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#2563eb' }} />
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8 text-gray-900">
            Creative Productions
          </h2>
        </div>

        {/* Featured card */}
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden shadow-md">

            {/* Video embed */}
            <div className="relative">
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  title={projectTitle}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full rounded-t-3xl"
                />
              </div>
              <div className="absolute top-6 right-6">
                <span
                  className="rounded-xl px-4 py-2 text-sm font-medium text-white"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(25px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  Latest Project
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-8 lg:p-12">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>
                  Commercial
                </span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{projectTitle}</h3>
              <p className="text-lg text-gray-500 leading-relaxed mb-6">{projectDescription}</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {[['Industry', industry], ['Style', style], ['Tone', tone], ['Format', format]].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-gray-400 block">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
