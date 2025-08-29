import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";

import ComingSoon from "./components/Common/ComingSoon";
import Layout from "./layouts/layout";
import DashboardPage from "./components/Dashboard/page";
import DetailedView from "./components/DetailedView/DetailedView";
import SummaryView from "./components/SummayView/Page";
import BillabilityPage from "./components/Billability/BillabilityPage";
import SpotCheckOverview from "./components/SpotCheck/Page";

function App() {
    return (
        <ThemeProvider storageKey="theme">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="dashboard/summary" element={<SummaryView />} />
                        <Route path="dashboard/detailed" element={<DetailedView />} />
                        <Route path="/info/billability" element={<BillabilityPage />} />
                        <Route path="/info/spotcheck" element={<SpotCheckOverview />} />
                        {/* All other sidebar links show ComingSoon */}
                        <Route path="*" element={<ComingSoon />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
