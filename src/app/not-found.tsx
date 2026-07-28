import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] dot-grid-bg">
      <div className="text-center border border-[#111111] p-12 max-w-md mx-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-8">
          Extra Edition
        </p>
        <p className="font-serif text-8xl font-black text-[#111111] mb-4">404</p>
        <hr className="border-t-4 border-[#111111] w-16 mx-auto mb-6" />
        <p className="font-serif text-xl font-bold mb-2">页面未找到</p>
        <p className="font-body text-sm text-neutral-500 mb-8">
          这篇报道尚未付印，或已被撤版。
        </p>
        <Link
          href="/"
          className="inline-block font-mono text-xs uppercase tracking-widest border border-[#111111] px-6 py-3 hover:bg-[#111111] hover:text-[#F9F9F7] transition-colors"
        >
          返回首页
        </Link>
        <p className="font-mono text-[10px] text-neutral-400 mt-8">
          Fig. 404 — All the News That&apos;s Fit to Print
        </p>
      </div>
    </div>
  );
}
