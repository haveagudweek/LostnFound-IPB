import Hero from '../components/Hero/Hero';
import SearchSection from '../components/SearchSection/SearchSection';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import ItemSection from '../components/ItemSection/ItemSection';
import { foundItems, lostItems } from '../data/mockData';

function Dashboard() {
  return (
    <main id="dashboard-page">
      <Hero />
      <SearchSection />
      <HowItWorks />
      <ItemSection
        title="Barang Ditemukan Terbaru"
        items={foundItems}
        viewAllHref="/found"
      />
      <ItemSection
        title="Barang Hilang Terbaru"
        items={lostItems}
        viewAllHref="/lost"
        altBackground
      />
    </main>
  );
}

export default Dashboard;
