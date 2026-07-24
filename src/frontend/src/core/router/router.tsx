import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
//import ProtectedRoute from "./ProtectedRoute";
import ErrorHandler from "../components/errors/ErrorHandler";
import RootLayout from "../layouts/RootLayout";

import { AuthLayout } from "../layouts/AuthLayout";
import { LoginPage } from "../../features/users/pages/LoginPage";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { PatientsPage } from "../../features/patients/pages/PatientsPage";


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
            <h2>products page</h2>
            
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
          
            <PatientsPage/>
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
