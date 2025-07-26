import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AdminDashboardPage from "../modules/dashboard/pages/AdminDashboardPage";
import SoftwaresPage from "../modules/software/pages/SoftwaresPage";
import RequestsPage from "../modules/requests/pages/RequestsPage";
import PurchaseProjectsPage from "../modules/purchase/pages/PurchaseProjectsPage";
import ImportPage from "../modules/import/pages/ImportPage";
import NotificationsPage from "../modules/notifications/pages/NotificationCenterPage";
import BetaFlagsPage from "../modules/admin/pages/BetaFlagsPage";
import DebugApiPage from "../modules/debug/DebugApiPage";
export const router = createBrowserRouter([{
  element:<AppLayout/>,
  children:[
    { index:true, element:<Navigate to="/dashboard" replace/> },
    { path:"/dashboard", element:<AdminDashboardPage/> },
    { path:"/logiciels", element:<SoftwaresPage/> },
    { path:"/demandes", element:<RequestsPage/> },
    { path:"/projets", element:<PurchaseProjectsPage/> },
    { path:"/import", element:<ImportPage/> },
    { path:"/notifications", element:<NotificationsPage/> },
    { path:"/beta-flags", element:<BetaFlagsPage/> },
    { path:"/debug-api", element:<DebugApiPage/> },
    { path:"*", element:<Navigate to="/dashboard" replace/> }
  ]
}]);