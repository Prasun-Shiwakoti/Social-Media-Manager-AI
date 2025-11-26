import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/dashboard/Dashboard";
import AICreator from "@/pages/features/AICreator";
import Analytics from "@/pages/features/Analytics";
import Comments from "@/pages/features/Comments";
import DMAssistant from "@/pages/features/DMAssistant";
import Insights from "@/pages/features/Insights";
import Settings from "@/pages/features/Settings";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";

import LandingPage from "@/pages/LandingPage";
import Scheduler from "@/pages/features/Scheduler";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<AICreator />} />
          <Route path="/schedule" element={<Scheduler />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/dms" element={<DMAssistant />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
