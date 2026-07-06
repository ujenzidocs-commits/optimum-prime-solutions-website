import TallyLanding from '../components/TallyLanding';
import Hero3D from '../components/Hero3D';
import TrustBanner from '../components/TrustBanner';
import Partners from '../components/Partners';
import WebinarBanner from '../components/WebinarBanner';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <TallyLanding />
      <WebinarBanner />
      <Hero3D />
      <Partners />
      <TrustBanner />
    </div>
  );
}
