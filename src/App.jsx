import { useCallback, useRef, useState } from "react";
import { CartProvider, useCart } from "./context/CartContext.jsx";
import { CatalogProvider } from "./context/CatalogContext.jsx";
import { useReveal } from "./hooks/useReveal.js";
import AnnouncementBar from "./components/AnnouncementBar.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import CollectionGrid from "./components/CollectionGrid.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import BrandStory from "./components/BrandStory.jsx";
import BestSellers from "./components/BestSellers.jsx";
import Testimonials from "./components/Testimonials.jsx";
import InstagramGallery from "./components/InstagramGallery.jsx";
import FAQ from "./components/FAQ.jsx";
import Footer from "./components/Footer.jsx";
import ProductDetailModal from "./components/ProductDetailModal.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import FloatingWhatsApp from "./components/FloatingWhatsApp.jsx";
import Toast from "./components/Toast.jsx";

function Storefront() {
  const { isOpen: cartOpen } = useCart();
  const [filter, setFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  // The modal keeps showing the last product while it animates closed
  const [viewed, setViewed] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const openCount = useRef(0);

  useReveal();

  const viewProduct = useCallback((product) => {
    openCount.current += 1;
    setViewed({ product, openId: `${product.id}-${openCount.current}` });
    setModalOpen(true);
  }, []);
  const closeProduct = useCallback(() => setModalOpen(false), []);

  const showCollection = useCallback((f) => {
    setFilter(f);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <AnnouncementBar />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main id="main">
        <Hero />
        <CollectionGrid onSelect={showCollection} />
        <ProductGrid filter={filter} setFilter={setFilter} onView={viewProduct} />
        <BrandStory />
        <BestSellers onView={viewProduct} onSeeAll={showCollection} />
        <Testimonials />
        <InstagramGallery />
        <FAQ />
      </main>
      <Footer />

      <ProductDetailModal
        product={viewed?.product}
        openId={viewed?.openId}
        isOpen={modalOpen}
        onClose={closeProduct}
      />
      <CartDrawer />
      <Toast />
      <FloatingWhatsApp hidden={cartOpen || modalOpen || menuOpen} />
    </>
  );
}

export default function App() {
  return (
    <CatalogProvider>
      <CartProvider>
        <Storefront />
      </CartProvider>
    </CatalogProvider>
  );
}
