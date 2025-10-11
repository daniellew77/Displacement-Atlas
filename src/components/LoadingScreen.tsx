export default function LoadingScreen({ year }: { year: number }) {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4" />
        <p className="text-white text-xl">Loading displacement data...</p>
      </div>
    </div>
  );
}