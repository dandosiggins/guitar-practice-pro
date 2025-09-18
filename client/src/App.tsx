import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Home, { HomeTabContext } from "@/pages/home";
import SongsPage from "@/pages/songs";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/songs" component={SongsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('metronome');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HomeTabContext.Provider value={{ activeTab, setActiveTab }}>
          <div className="min-h-screen bg-[#0f172a] text-slate-100">
            <Header />
            <Toaster />
            <Router />
          </div>
        </HomeTabContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
