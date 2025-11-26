export default function AuthButton({ loading, label, loadingLabel = "Processing..." }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xl font-semibold p-4 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-6"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
