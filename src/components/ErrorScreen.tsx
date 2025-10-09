export default function ErrorScreen({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="bg-red-900/50 backdrop-blur-md rounded-lg p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Error Loading Data</h2>
        <p className="text-gray-300 mb-4">{error.message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}