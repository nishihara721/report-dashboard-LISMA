import NavBar from "../components/NavBar";
import SessionProviderWrapper from '../components/SessionProviderWrapper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProviderWrapper>
      {/* スマホ：トップロゴバー */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#EEF3F6] border-b border-[#C8DCE8] h-14 flex items-center px-4">
        <img src="/logo.png" alt="ロゴ" className="h-8 object-contain" />
      </header>
      <div className="flex flex-1">
        <NavBar />
        <main className="flex-1 p-8 pt-20 md:pt-8 pb-20 md:pb-8 overflow-auto bg-[#FFF]">
          {children}
        </main>
      </div>
    </SessionProviderWrapper>
  );
}