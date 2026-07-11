import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
//import ProtectedRoute from "./ProtectedRoute";
import ErrorHandler from "../components/errors/ErrorHandler";
import RootLayout from "../layouts/RootLayout";
import ProductsPage from "../../features/products/pages/productsPage";
import { AuthLayout } from "../layouts/AuthLayout";
import { LoginPage } from "../../features/users/pages/LoginPage";
import { DashboardLayout } from "../layouts/DashboardLayout";


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/*Auth Layout */} 
      <Route path="/auth" element={<AuthLayout />} errorElement={<ErrorHandler />}>
        <Route index element={
            /*<ProtectedRoute
              isAllowed={userData?.jwt}
              redirectPath="/login"
              data={userData}
            >
              <HomePage />
            </ProtectedRoute>*/
            <LoginPage />
          }
        />
        <Route
          path="products"
          element={
            /*<ProtectedRoute>
              <h2>Profile page</h2>
            </ProtectedRoute>*/
            <ProductsPage />
            
          }
        />
      </Route>

      {/* Root Layout */}
      <Route path="/" element={<DashboardLayout />} errorElement={<ErrorHandler />}>
        <Route
          index
          element={
            /*<ProtectedRoute
              isAllowed={userData?.jwt}
              redirectPath="/login"
              data={userData}
            >
              <HomePage />
            </ProtectedRoute>*/
          
            <h2>Profile page</h2>
          }
        />
        <Route
          path="dashboard"
          element={
            /*<ProtectedRoute>
              <h2>Profile page</h2>
            </ProtectedRoute>*/
            <h2>appointments page</h2>
            
          }
        />
      </Route>

      {/* Page Not Found */}
      <Route path="*" element={/*<PageNotFound />*/<h2>Profile page</h2>} />
    </>
  )
);

export default router;
