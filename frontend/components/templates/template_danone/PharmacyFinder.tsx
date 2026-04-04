'use client';
import { useState, useEffect, useRef } from 'react';

interface Pharmacy {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  distanceKm?: number | null;
}

interface PharmacyFinderContent {
  title?: string;
  apiUrl?: string;
}

export function PharmacyFinder({ content }: { content: PharmacyFinderContent }) {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Wait for next frame so container has real dimensions before Leaflet init
    const raf = requestAnimationFrame(() => {
      import('leaflet').then((L) => {
        if (!mapContainerRef.current || mapRef.current) return;
        const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([-23.5335, -46.8100], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
        }).addTo(map);
        mapRef.current = map;
        // Force size recalculation a few times to cover any layout reflows
        [100, 300, 600].forEach((ms) => setTimeout(() => map.invalidateSize(), ms));
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  const formatZip = (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cep = zipCode.replace(/\D/g, '');
    if (cep.length < 8) return;

    setLoading(true);
    setSearched(false);

    try {
      if (content.apiUrl) {
        const res = await fetch(`${content.apiUrl}?cep=${cep}`);
        if (res.ok) {
          const data: Pharmacy[] = await res.json();
          updateMap(data);
          setPharmacies(data);
        }
      } else {
        // Sem API configurada — busca coordenadas do CEP via ViaCEP + mostra no mapa
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setPharmacies([{
            name: 'Pesquise farmácias próximas',
            address: `${data.logradouro ?? ''}, ${data.bairro ?? ''} — ${data.localidade}/${data.uf}`,
            lat: 0, lng: 0,
          }]);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setSearched(true);
      setSelectedIdx(0);
      if (mapRef.current) setTimeout(() => mapRef.current.invalidateSize(), 300);
    }
  };

  const updateMap = async (items: Pharmacy[]) => {
    if (!mapRef.current) return;
    const L = await import('leaflet');
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    });

    const coords: [number, number][] = [];
    items.forEach((p, i) => {
      if (p.lat && p.lng) {
        const m = L.marker([p.lat, p.lng], { icon })
          .addTo(mapRef.current)
          .bindPopup(`<strong>${p.name}</strong><br/>${p.address}`);
        m.on('click', () => setSelectedIdx(i));
        markersRef.current.push(m);
        coords.push([p.lat, p.lng]);
      }
    });

    if (coords.length > 0) {
      mapRef.current.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 14 });
    }
  };

  const handleSelectPharmacy = (idx: number) => {
    setSelectedIdx(idx);
    const p = pharmacies[idx];
    if (p.lat && p.lng && mapRef.current) {
      mapRef.current.setView([p.lat, p.lng], 15);
      markersRef.current[idx]?.openPopup();
    }
  };

  return (
    <section id="farmacia" className="w-full py-10 md:py-16" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-5">
        <form onSubmit={handleSearch} className="mb-8 md:mb-10">
          <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-6">
            <h2 className="text-white text-2xl md:text-[1.5rem] font-bold uppercase text-center xl:text-left leading-tight xl:max-w-[620px]">
              {content.title ?? 'Encontre a farmácia mais próxima de você'}
            </h2>
            <div className="flex flex-col items-center sm:flex-row gap-4 w-full xl:flex-1 xl:justify-end px-[10%] sm:px-0">
              <div className="bg-white rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-3 w-full sm:max-w-[300px]">
                <img src="/assets/marker-icon.webp" alt="Localização" className="w-5 h-5 object-contain" />
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(formatZip(e.target.value))}
                  placeholder="Digite seu CEP"
                  className="text-[#1E1E1E] text-base bg-transparent border-none outline-none flex-1 min-w-0"
                  maxLength={9}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="text-white text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-3 hover:opacity-80 transition-opacity disabled:opacity-60 w-full sm:w-auto sm:min-w-[220px] whitespace-nowrap"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                {loading ? 'Buscando...' : 'Encontrar farmácias'}
              </button>
            </div>
          </div>
        </form>

        <div className={`flex flex-col ${searched ? 'lg:flex-row' : ''} gap-6 lg:gap-8`}>
          {/* Map container — explicit width+height so Leaflet never initialises into a 0px box */}
          <div
            className="rounded-[10px] shrink-0 overflow-hidden"
            style={{
              height: 450,
              width: searched ? undefined : '100%',
              minWidth: searched ? 380 : undefined,
              maxWidth: searched ? 480 : undefined,
              position: 'relative',
              zIndex: 0,
            }}
          >
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
          </div>

          {searched && pharmacies.length > 0 && (
            <div className="flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4 max-h-[450px] overflow-y-auto pr-1">
                {pharmacies.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectPharmacy(i)}
                    className="bg-[#F2F2F2] rounded-[10px] p-3 md:p-6 cursor-pointer transition-all"
                    style={selectedIdx === i ? { border: '2px solid var(--color-primary)' } : {}}
                  >
                    <h3 className="text-[#212121] text-base md:text-xl font-semibold mb-1 md:mb-3 line-clamp-2">{p.name}</h3>
                    <p className="text-[#212121] text-xs md:text-sm mb-1 line-clamp-2">{p.address}</p>
                    {p.phone && <p className="text-[#212121] text-xs md:text-sm opacity-60">Tel: {p.phone}</p>}
                    <button className="text-sm font-semibold underline flex items-center gap-1 hover:opacity-80 mt-2"
                      style={{ color: 'var(--color-primary)' }}>
                      Ver no mapa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searched && pharmacies.length === 0 && (
            <p className="text-white text-center py-8">Nenhuma farmácia encontrada para esse CEP.</p>
          )}
        </div>
      </div>
    </section>
  );
}
