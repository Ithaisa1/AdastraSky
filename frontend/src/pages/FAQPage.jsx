import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const FAQPage = () => {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = t('faq.sections', { returnObjects: true });
  const sections = Array.isArray(faqData) ? faqData : [];

  const toggleItem = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const term = searchTerm.trim().toLowerCase();
  const filtered = sections
    .map((cat, catIdx) => ({
      ...cat,
      catIdx,
      items: cat.items
        .map((item, itemIdx) => ({ ...item, itemIdx }))
        .filter(item => !term || item.q.toLowerCase().includes(term) || item.a.toLowerCase().includes(term)),
    }))
    .filter(cat => cat.items.length > 0);

  return (
    <div className="h-screen w-full flex bg-deepSpace overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-3 overflow-y-auto">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-astroAccent/20 to-cosmicPurple/20 border border-astroAccent/20 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-astroAccent" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('faq.title')}</h1>
              <p className="text-sm text-gray-400">{t('faq.subtitle')}</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <label htmlFor="faq-search" className="sr-only">{t('faq.search')}</label>
            <input
              id="faq-search"
              type="search"
              placeholder={t('faq.search')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-astroCard/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-astroAccent focus:outline-none transition-colors"
            />
          </div>

          {filtered.length === 0 && <p className="text-gray-400" role="status">{t('faq.noResults')}</p>}

          {filtered.map((cat) => (
            <section key={cat.category} className="bg-astroCard/50 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">{cat.category}</h2>
              </div>
              <div className="divide-y divide-white/5">
                {cat.items.map((item) => {
                  const key = `${cat.catIdx}-${item.itemIdx}`;
                  const isOpen = !!openItems[key];
                  return (
                    <div key={key}>
                      <button
                        type="button"
                        onClick={() => toggleItem(cat.catIdx, item.itemIdx)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-${key}`}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="text-white font-medium pr-4">{item.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-astroAccent flex-shrink-0" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                        )}
                      </button>
                      {isOpen && (
                        <div id={`faq-${key}`} className="px-6 pb-4">
                          <p className="text-gray-300 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FAQPage;
