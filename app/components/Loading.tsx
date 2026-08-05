export default function Loading({ message = '読み込み中...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      {/* スピナー */}
      <div className="w-8 h-8 border-4 border-[#C8DCE8] border-t-[#7BB8D4] rounded-full animate-spin" />
      <p className="text-sm text-[#5A7A8A]">{message}</p>
    </div>
  );
}