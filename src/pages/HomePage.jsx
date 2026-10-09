import { STORE_CONFIG } from "../config/store.js";
import { usePageTitle } from "../router.jsx";
import Hero from "../components/Hero.jsx";
import CollectionGrid from "../components/CollectionGrid.jsx";
import FeaturedProducts from "../components/FeaturedProducts.jsx";
import BrandStory from "../components/BrandStory.jsx";
import BestSellers from "../components/BestSellers.jsx";
import Testimonials from "../components/Testimonials.jsx";
import InstagramGallery from "../components/InstagramGallery.jsx";
import FAQ from "../components/FAQ.jsx";

const HOME_TITLE = `${STORE_CONFIG.name} — Everyday Gold-Plated & Stainless Steel Jewelry`;

export default function HomePage({ onView }) {
  usePageTitle(HOME_TITLE);
  return (
    <>
      <Hero />
      <CollectionGrid />
      <FeaturedProducts onView={onView} />
      <BrandStory />
      <BestSellers onView={onView} />
      <Testimonials />
      <InstagramGallery />
      <FAQ />
    </>
  );
}
