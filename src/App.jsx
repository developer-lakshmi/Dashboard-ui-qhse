import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import SummaryView from "./components/Dashboard/SummaryView";
import DetailedView from "./components/Dashboard/DetailedView";
import ComingSoon from "./components/Common/ComingSoon";

function App() {
    return (
        <ThemeProvider storageKey="theme">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="dashboard/summary" element={<SummaryView />} />
                        <Route path="dashboard/detailed" element={<DetailedView />} />
                        {/* All other sidebar links show ComingSoon */}
                        <Route path="*" element={<ComingSoon />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
