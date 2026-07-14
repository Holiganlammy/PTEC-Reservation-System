import Link from 'next/link';
import { NextPage } from 'next';

const Custom404: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-800 px-4">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-lg text-gray-500 mb-6 text-center max-w-md">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-gray-600 text-white font-medium text-lg rounded-lg shadow-md hover:bg-gray-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default Custom404;
