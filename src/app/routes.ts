import { createBrowserRouter } from "react-router";
import { UserLayout, AdminLayout } from "./components/Layouts";
import { UserHome } from "./pages/user/UserHome";
import { UserCard } from "./pages/user/UserCard";
import { PointInfo } from "./pages/user/PointInfo";
import { UserCoupons } from "./pages/user/UserCoupons";
import { UserCouponInfo } from "./pages/user/UserCouponInfo";
import { UserHistory } from "./pages/user/UserHistory";
import { AdminBlog } from "./pages/admin/AdminBlog";
import { AdminCoupon } from "./pages/admin/AdminCoupon";
import { AdminScan } from "./pages/admin/AdminScan";
import { AdminHistory } from "./pages/admin/AdminHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: UserLayout,
    children: [
      { index: true, Component: UserHome },
      { path: "card", Component: UserCard },
      { path: "point-info", Component: PointInfo },
      { path: "coupons", Component: UserCoupons },
      { path: "coupon-info", Component: UserCouponInfo },
      { path: "history", Component: UserHistory },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminBlog },
      { path: "blog", Component: AdminBlog },
      { path: "coupon", Component: AdminCoupon },
      { path: "scan", Component: AdminScan },
      { path: "history", Component: AdminHistory },
    ],
  },
]);
