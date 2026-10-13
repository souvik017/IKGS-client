import { Link } from 'react-router-dom';
import { ArrowLeft, Home as HomeIcon, Search } from 'lucide-react';
import Seo from '../../components/public/Seo';
import Button from '../../components/ui/Button';

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" description="The page you are looking for could not be found." path="/404" noindex />
      <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-frost/60 blur-3xl" />
        </div>
        <div className="container-page flex flex-col items-center py-20 text-center">
          <span className="text-7xl font-extrabold text-gradient">404</span>
          <h1 className="mt-4 text-display">Page not found</h1>
          <p className="mt-4 max-w-md text-body">
            The page you are looking for may have been moved or no longer exists.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button to="/" icon={HomeIcon}>
              Back to Home
            </Button>
            <Button to="/services" variant="secondary" icon={Search}>
              Browse Services
            </Button>
          </div>
          <Link to="/contact" className="link mt-8 inline-flex items-center gap-1.5 text-sm">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Or contact our team
          </Link>
        </div>
      </section>
    </>
  );
}
