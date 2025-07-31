import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";

import SummaryView from "./components/SummayView/SummaryView";
import ComingSoon from "./components/Common/ComingSoon";
import Layout from "./layouts/layout";
import DashboardPage from "./components/Dashboard/page";
import DetailedView from "./components/DetailedView/DetailedView";

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
