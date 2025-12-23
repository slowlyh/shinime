import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import AnimeListPage from "./pages/AnimeListPage";
import GenreListPage from "./pages/GenreListPage";
import AnimeDetailPage from "./pages/AnimeDetailPage";
import StreamPage from "./pages/StreamPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/genres" element={<GenreListPage />} />
            <Route path="/anime/:id" element={<AnimeDetailPage />} />
            <Route path="/anime/list/:type" element={<AnimeListPage />} />
            <Route path="/watch/:animeId/:episodeId" element={<StreamPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
