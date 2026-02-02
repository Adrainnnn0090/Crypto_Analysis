import Link from 'next/link';
import { FiHome } from 'react-icons/fi';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-crypto-btc mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-crypto-btc text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <FiHome className="mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}