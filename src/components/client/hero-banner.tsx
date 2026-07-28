interface HeroBannerProps {
  backgroundPath: string | null;
  avatarPath: string | null;
  siteTitle: string;
  bio: string | null;
}

export function HeroBanner({ backgroundPath, avatarPath, siteTitle, bio }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#111111]">
      {/* Background image */}
      <div className="relative h-[40vh] md:h-[55vh] min-h-[320px] bg-neutral-200">
        {backgroundPath ? (
          <img
            src={`/${backgroundPath}`}
            alt="背景图片"
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full halftone-placeholder" />
        )}

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F9F9F7] via-transparent to-transparent" />
      </div>

      {/* Avatar + Title + Bio overlay */}
      <div className="max-w-screen-xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6 pb-12">
          {/* Avatar */}
          <div className="w-40 h-40 md:w-48 md:h-48 border-4 border-[#111111] bg-[#F9F9F7] flex-shrink-0 overflow-hidden">
            {avatarPath ? (
              <img
                src={`/${avatarPath}`}
                alt="个人头像"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full halftone-placeholder flex items-center justify-center">
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
                  头像
                </span>
              </div>
            )}
          </div>

          {/* Title & Bio */}
          <div className="flex-1">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tighter text-[#111111]">
              {siteTitle}
            </h1>
            {bio && (
              <div className="mt-6 max-w-2xl">
                <p className="font-body text-base lg:text-lg leading-relaxed text-neutral-700 drop-cap">
                  {bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
