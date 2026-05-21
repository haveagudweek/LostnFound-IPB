import { useEffect, useState } from 'react';
import Hero from '../components/Hero/Hero';
import SearchSection from '../components/SearchSection/SearchSection';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import ItemSection from '../components/ItemSection/ItemSection';
import { api } from '../services/api';

function Dashboard() {
  const [foundItems, setFoundItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLatestItems() {
      setLoading(true);
      setError(null);
      try {
        const [foundData, lostData] = await Promise.all([
          api.getItems('found'),
          api.getItems('lost'),
        ]);

        if (!cancelled) {
          setFoundItems(foundData.slice(0, 5));
          setLostItems(lostData.slice(0, 4));
        }
      } catch {
        if (!cancelled) setError('Gagal memuat data barang terbaru.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLatestItems();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main id="dashboard-page">
      <Hero />
      <SearchSection />
      <HowItWorks />
      <ItemSection
        title="Barang Ditemukan Terbaru"
        items={foundItems}
        viewAllHref="/found"
        loading={loading}
        error={error}
      />
      <ItemSection
        title="Barang Hilang Terbaru"
        items={lostItems}
        viewAllHref="/lost"
        altBackground
        loading={loading}
        error={error}
      />
    </main>
  );
}

export default Dashboard;
