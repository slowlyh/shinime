import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import AnimeListPage from "./pages/AnimeListPage";
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
            <Route path="/anime/:id" element={<AnimeDetailPage />} />
            <Route path="/donghua/:id" element={<AnimeDetailPage />} />
            <Route path="/latest" element={<AnimeListPage />} />
            <Route path="/anime/list/:type" element={<AnimeListPage />} />
            <Route path="/watch/:animeId/:episodeId" element={<StreamPage />} />
            {/* Redirect genre page to home/latest */}
            <Route path="/genres" element={<Navigate to="/latest" replace />} />
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
