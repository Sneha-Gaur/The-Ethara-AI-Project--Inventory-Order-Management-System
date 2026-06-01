export default function LoadingSpinner({ fullScreen = false }) {
  const wrapper = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/80'
    : 'flex justify-center py-12';
  return (
    <div className={wrapper}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
    </div>
  );
}
