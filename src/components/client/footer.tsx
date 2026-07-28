export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-[#111111] bg-[#F9F9F7] mt-16">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-black mb-2">个人主页</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              Vol. 1 — Edition
              <br />
              Printed in Digital
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest mb-4 text-neutral-500">
              导航
            </h4>
            <nav className="flex flex-col gap-2">
              <a href="#" className="font-body text-sm hover:text-[#CC0000] transition-colors underline-offset-4 decoration-2 decoration-[#CC0000] hover:underline">
                首页
              </a>
              <a href="#portfolio" className="font-body text-sm hover:text-[#CC0000] transition-colors underline-offset-4 decoration-2 decoration-[#CC0000] hover:underline">
                作品
              </a>
              <a href="#about" className="font-body text-sm hover:text-[#CC0000] transition-colors underline-offset-4 decoration-2 decoration-[#CC0000] hover:underline">
                关于
              </a>
            </nav>
          </div>

          {/* Copyright */}
          <div className="md:text-right">
            <p className="font-mono text-xs text-neutral-500 leading-relaxed">
              &copy; {year} 个人主页
              <br />
              保留所有权利
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-4 border-t border-[#111111] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Fig. 1.1 — All the News That&apos;s Fit to Print
          </p>
          <p className="font-mono text-[10px] text-neutral-400">
            Powered by Next.js &middot; Newsprint Design
            <span className="mx-2 text-neutral-300">|</span>
            <a href="/admin/login" className="hover:text-neutral-600 transition-colors">管理</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
