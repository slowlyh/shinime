import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6">
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-bold text-accent/10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                Page Not Found
              </p>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/search">
              <Search className="w-4 h-4" />
              Search Anime
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
