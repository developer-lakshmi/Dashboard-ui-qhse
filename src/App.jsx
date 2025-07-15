import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import SummaryView from "./components/Dashboard/SummaryView";
// Create a placeholder ./components/Dashboard/SummaryViewew

function App() {
    return (
        <ThemeProvider storageKey="theme">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="dashboard/summary" element={<SummaryView />} />
                        <Route path="analytics" element={<h1 className="title">Analytics</h1>} />
                        <Route path="reports" element={<h1 className="title">Reports</h1>} />
                        <Route path="customers" element={<h1 className="title">Customers</h1>} />
                        <Route path="new-customer" element={<h1 className="title">New Customer</h1>} />
                        <Route path="verified-customers" element={<h1 className="title">Verified Customers</h1>} />
                        <Route path="products" element={<h1 className="title">Products</h1>} />
                        <Route path="new-product" element={<h1 className="title">New Product</h1>} />
                        <Route path="inventory" element={<h1 className="title">Inventory</h1>} />
                        <Route path="settings" element={<h1 className="title">Settings</h1>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
