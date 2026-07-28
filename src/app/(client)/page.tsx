import { getDb } from "@/lib/db";
import { SectionHeader } from "@/components/ui/section-header";
import { Divider } from "@/components/ui/divider";
import { HeroBanner } from "@/components/client/hero-banner";
import { PortfolioCarousel } from "@/components/client/portfolio-carousel";
import type { SiteConfig } from "@/lib/types";

async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const db = getDb();
    const result = await db
      .prepare("SELECT * FROM site_config WHERE id = 1")
      .all<SiteConfig>();
    return result.results[0] || {
      avatar_path: null, background_path: null, bio: null, site_title: "个人主页",
    };
  } catch {
    return { avatar_path: null, background_path: null, bio: null, site_title: "个人主页" };
  }
}

export default async function HomePage() {
  const config = await getSiteConfig();

  return (
    <>
      {/* Hero Banner */}
      <HeroBanner
        backgroundPath={config.background_path}
        avatarPath={config.avatar_path}
        siteTitle={config.site_title}
        bio={config.bio}
      />

      <Divider variant="ornament" />

      {/* Portfolio Carousel */}
      <section id="portfolio" className="max-w-screen-xl mx-auto px-4 py-16">
        <SectionHeader
          label="作品集"
          heading="精选作品"
        />
        <PortfolioCarousel />
      </section>

      <Divider variant="heavy" />

      {/* About Section */}
      <section id="about" className="max-w-screen-xl mx-auto px-4 py-16">
        <SectionHeader
          label="关于"
          heading="关于本站"
        />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
          <div className="md:col-span-7">
            <p className="font-body text-base leading-relaxed text-neutral-700 text-justify">
              这是一个采用 Newsprint 新闻纸风格设计的个人网站。
              设计灵感来源于传统报纸印刷——高对比度的黑白配色、
              零圆角的几何线条、衬线字体的排版节奏，
              以及无处不在的网格结构。
            </p>
            <p className="font-body text-sm leading-relaxed text-neutral-600 mt-4">
              网站使用 Next.js 构建，数据存储在 SQLite 中，
              管理端通过独立登录页面进行内容更新。
              所有图片默认以灰度展示，hover 时呈现复古棕褐色调——
              如同翻阅一张老报纸。
            </p>
          </div>
          <div className="md:col-span-5 border border-[#111111] p-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
              技术栈
            </h3>
            <ul className="space-y-3 font-mono text-xs text-neutral-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#111111] inline-block" />
                Next.js 15 · App Router
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#111111] inline-block" />
                TypeScript · Tailwind CSS
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#111111] inline-block" />
                SQLite · better-sqlite3
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#111111] inline-block" />
                iron-session · bcrypt
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Divider variant="ornament" />
    </>
  );
}
