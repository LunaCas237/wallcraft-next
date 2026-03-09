'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer'; // Adjust this path if your Footer component is located elsewhere

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Define the exact paths where the footer should be hidden
  const hiddenPaths = ['/login', '/register','/profile'];

  // If the current URL is in the hiddenPaths array, return nothing
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  // Otherwise, render the normal Footer
  return <Footer />;
}