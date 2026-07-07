import TallyLanding from '../components/TallyLanding';
import Hero3D from '../components/Hero3D';
import TrustBanner from '../components/TrustBanner';
import Partners from '../components/Partners';
import TallyPromoPopup from '../components/TallyPromoPopup';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <TallyPromoPopup />
      <TallyLanding />
      <Hero3D />
      <Partners />
      <TrustBanner />
    </div>
  );
}
