import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminContents from "./pages/AdminContents";
import AdminUsers from "./pages/AdminUsers";
import ContentDetail from "./pages/ContentDetail";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/content/:id" element={<ContentDetail />} />

          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin/contents" element={<AdminContents />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
