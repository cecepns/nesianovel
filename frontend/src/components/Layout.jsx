import PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import BottomNavigation from "./BottomNavigation";
import DesktopSidebar from "./DesktopSidebar";
import FloatingFixedAd from "./FloatingFixedAd";
import { useAds } from "../hooks/useAds";

const Layout = ({ children }) => {
  const { ads: floatingTopAds } = useAds("floating-fixed-top");
  const { ads: floatingBottomAds } = useAds("floating-fixed-bottom");

  return (
    <div className="relative min-h-screen bg-[#0a0614] text-gray-100 dark:bg-[#0a0614] dark:text-gray-100">
      {/* Background UI: Deep Dark Purple Ambient Radiance */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        {/* Solid dark purple base */}
        <div className="absolute inset-0 bg-[#0a0614]" />

        {/* Ambient Purple / Violet Radiance */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-10 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[140px]" />

        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(rgba(168, 85, 247, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Desktop Left Sidebar (Appears on all pages on desktop) */}
      <DesktopSidebar />

      {/* Main Content Container (Padded left on desktop for sidebar) */}
      <div className="relative z-[1] flex min-h-screen flex-col md:pl-64">
        <Header />

        <main className="flex-1 pt-16 pb-24 md:pb-12 lg:pt-16">
          {children}
        </main>

        <Footer />

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>

      <FloatingFixedAd position="top" ads={floatingTopAds} />
      <FloatingFixedAd position="bottom" ads={floatingBottomAds} />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
