export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} ShopStream. All rights reserved.</p>
          <p className="mt-1">This is a checkout template for demonstration purposes.</p>
        </div>
      </div>
    </footer>
  );
}
