import { useCallback, useEffect, useRef, useState } from "react";
import { CartProvider, useCart } from "./context/CartContext.jsx";
import { CatalogProvider } from "./context/CatalogContext.jsx";
import { useReveal } from "./hooks/useReveal.js";
import { RouterProvider, useRouter } from "./router.jsx";
import AnnouncementBar from "./components/AnnouncementBar.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ProductDetailModal from "./components/ProductDetailModal.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import FloatingWhatsApp from "./components/FloatingWhatsApp.jsx";
import Toast from "./components/Toast.jsx";
import HomePage from "./pages/HomePage.jsx";
import CollectionPage from "./pages/CollectionPage.jsx";
import NotFound from "./pages/NotFound.jsx";

/** "/" → home, "/collections/<id>" → that collection, anything else → not found. */
function matchRoute(path) {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/" || clean === "/index.html") return { page: "home" };
  const m = clean.match(/^\/collections\/([^/]+)$/);
  if (m) return { page: "collection", id: decodeURIComponent(m[1]) };
  if (clean === "/collections" || clean === "/shop") return { page: "collection", id: "all" };
  return { page: "notfound" };
}

function Storefront() {
  const { isOpen: cartOpen, closeCart } = useCart();
  const { path } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // The modal keeps showing the last product while it animates closed
  const [viewed, setViewed] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const openCount = useRef(0);

  // Re-run scroll animations for each page
  useReveal([path]);

  // Changing page closes any open panel
  useEffect(() => {
    setModalOpen(false);
    setMenuOpen(false);
    closeCart();
  }, [path, closeCart]);

  const viewProduct = useCallback((product) => {
    openCount.current += 1;
    setViewed({ product, openId: `${product.id}-${openCount.current}` });
    setModalOpen(true);
  }, []);
  const closeProduct = useCallback(() => setModalOpen(false), []);

  const route = matchRoute(path);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <AnnouncementBar />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main id="main">
        {route.page === "home" && <HomePage onView={viewProduct} />}
        {route.page === "collection" && <CollectionPage key={route.id} id={route.id} onView={viewProduct} />}
        {route.page === "notfound" && <NotFound />}
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
    <RouterProvider>
      <CatalogProvider>
        <CartProvider>
          <Storefront />
        </CartProvider>
      </CatalogProvider>
    </RouterProvider>
  );
}
