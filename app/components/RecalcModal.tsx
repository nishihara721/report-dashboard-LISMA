'use client';

type Props = {
  status: 'calculating' | 'done' | null;
};

export default function RecalcModal({ status }: Props) {
  if (!status) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl border border-[#C8DCE8] p-8 flex flex-col items-center gap-4 w-72 shadow-lg">
        {status === 'calculating' ? (
          <>
            <div className="w-10 h-10 border-4 border-[#C8DCE8] border-t-[#7BB8D4] rounded-full animate-spin" />
            <p className="text-sm font-semibold text-[#3A5A6A]">広告費を再計算中...</p>
            <p className="text-xs text-[#5A7A8A] text-center">しばらくお待ちください</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#3A5A6A]">再計算が完了しました</p>
          </>
        )}
      </div>
    </div>
  );
}