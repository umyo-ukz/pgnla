
import AnnouncementBar from "../components/Home/AnnouncementBar";
import Programs from "../components/Home/Programs";
import QuickLinks from "../components/Home/QuickLinks";
import CTA from "../components/Home/CTA";
import HomeHero from "../components/Home/HomeHero";

export default function Home() {
  return (
    <>
      <HomeHero />
      <AnnouncementBar />
      <Programs />
      <QuickLinks />
      <CTA />
    </>
  );
}
