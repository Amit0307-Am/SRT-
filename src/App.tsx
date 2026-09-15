import { useEffect, useMemo, useState } from 'react'
import './App.css'
import logo from './assets/logo-image.webp'
import { siteConfig } from './config/site'
import { categories, menuItems, type MenuItem } from './data/menu'

type SizeKey = 'small' | 'medium' | 'large'

const formatPrice = (value: number) => `₹${value}`
const toAbsoluteImageUrl = (imagePath?: string) => {
  if (!imagePath) return 'Food image to be added'
  if (imagePath.startsWith('http')) return imagePath
  return typeof window === 'undefined' ? imagePath : new URL(imagePath, window.location.origin).href
}

const buildOrderLink = (item: MenuItem, options?: { size?: SizeKey; quantity?: number; addOns?: string[] }) => {
  const size = options?.size ?? 'medium'
  const quantity = options?.quantity ?? 1
  const addOns = options?.addOns ?? []
  const hasKnownPrice = item.price != null || Object.values(item.sizes ?? {}).some((value) => typeof value === 'number')
  let unitTotal = item.price ?? 0
  if (item.sizes?.[size] != null) unitTotal = item.sizes[size] ?? 0
  for (const addon of item.addOns ?? []) {
    if (addOns.includes(addon.name) && addon.prices?.[size] != null) unitTotal += addon.prices[size] ?? 0
  }
  const message = [
    'Hi Cafe SRT 👋', '', 'I would like to order:', '',
    `${item.category === 'Pizza' || item.sizes ? '🍕' : '🍔'} Item: ${item.name}`,
    ...(item.category === 'Pizza' || item.sizes ? [`📏 Size: ${size.charAt(0).toUpperCase() + size.slice(1)}`] : []),
    ...(addOns.length ? [`➕ Add-on: ${addOns.join(', ')}`] : []),
    `🔢 Quantity: ${quantity}`,
    hasKnownPrice ? `💰 Total: ${formatPrice(unitTotal * quantity)}` : '💰 Price: Please confirm on WhatsApp',
    '', '🖼️ Product:', toAbsoluteImageUrl(item.image), '', '📍 Delivery: Mangalvedha', '',
    'Please confirm availability and delivery time.',
  ].join('\n')
  return `${siteConfig.whatsappLink}?text=${encodeURIComponent(message)}`
}

function Navbar({ isOrderPage, onMenuToggle, onMenuClose, menuOpen }: { isOrderPage: boolean; onMenuToggle: () => void; onMenuClose: () => void; menuOpen: boolean }) {
  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onMenuClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, onMenuClose])

  const handleNavigation = () => onMenuClose()

  return <>
    <header className="topbar">
    <a className="brand" href="/" aria-label="Cafe SRT home"><img src={logo} alt="Cafe SRT logo" /><span>Cafe SRT</span></a>
    <button type="button" className="menu-toggle" onClick={onMenuToggle} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>{menuOpen ? '×' : '☰'}</button>
    <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
      <a href={isOrderPage ? '/' : '#home'} onClick={handleNavigation}>Home</a><a href={isOrderPage ? '/#about' : '#about'} onClick={handleNavigation}>About</a><a href={isOrderPage ? '/' : '#gallery'} onClick={handleNavigation}>Gallery</a><a href={isOrderPage ? '/#location' : '#location'} onClick={handleNavigation}>Location</a><a href={isOrderPage ? '/#contact' : '#contact'} onClick={handleNavigation}>Contact</a>
    </nav>
    <a className={`nav-cta ${isOrderPage ? 'active' : ''}`} href="/order" onClick={handleNavigation}>🍔 Order Food</a>
    </header>
    {menuOpen && <button type="button" className="mobile-menu-backdrop" aria-label="Close menu" onClick={onMenuClose} />}
  </>
}

function EmptyImage({ label = 'Food illustration' }: { label?: string }) { return <div className="empty-image" aria-label={label}><span>✦</span><small>made fresh</small></div> }
function CafePlaceholder({ label }: { label: string }) { return <div className="cafe-placeholder" aria-label={label}><span className="cafe-mark">SRT</span><small>Eat · Sip · Relax</small><i className="steam steam-one" /><i className="steam steam-two" /></div> }

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <>
    <div className="announcement-bar">❤️ Couple Friendly • Cozy Cafe • Mangalvedha</div>
    <main className="page-shell"><Navbar isOrderPage={false} menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} onMenuClose={() => setMenuOpen(false)} />
      <section className="hero home-hero" id="home"><div className="hero-copy"><p className="eyebrow">CAFE SRT • MANGALVEDHA</p><div className="premium-badge">♥ Couple Friendly</div><h1>Good Food.<br />Great Vibes.<br /><em>Better Together.</em></h1><p className="hero-subtitle">Your cozy spot in Mangalvedha for coffee dates, casual hangouts and delicious bites.</p><div className="cta-row"><a href="/order" className="primary-btn">Order Food <span>↗</span></a><a href="#location" className="tertiary-btn">Find Us</a></div><div className="hero-meta"><span>♥ Couple Friendly</span><span>☕ Cozy Vibes</span><span>✦ Fresh Bites</span></div></div><div className="hero-visual"><CafePlaceholder label="Cafe SRT cafe illustration" /><div className="hero-sticker" aria-label="Cafe SRT Mangalvedha stamp"><strong>CAFE SRT</strong><span>MANGALVEDHA</span><small>• SIP · EAT · RELAX •</small></div><div className="small-card"><div className="small-card-badge">Good conversations live here</div><p>A comfortable place for coffee dates, relaxed conversations and casual hangouts.</p></div></div></section>
      <section className="experience-strip" aria-label="Cafe experience"><span>♥ <b>Couple Friendly</b></span><span>☕ <b>Cozy Atmosphere</b></span><span>✦ <b>Delicious Bites</b></span><span>⌖ <b>Mangalvedha</b></span></section>
      <section className="about-section split-section" id="about"><div><p className="eyebrow eyebrow-inline">About Cafe SRT</p><h2>A relaxed corner in Mangalvedha.</h2></div><div><p>Cafe SRT brings fast food, beverages and an easygoing cafe environment together in Shivaji Nagar, Mangalvedha.</p><p>Come by for a casual hangout, a coffee date or a quick bite. Delivery is available across Mangalvedha.</p><a className="text-link" href="#location">Find the cafe →</a></div></section>
      <section className="vibe-section"><div className="section-heading"><p className="eyebrow eyebrow-inline">Good Vibes</p><h2>Made for good conversations.</h2><p className="section-lede">Whether it's a coffee date, catching up with friends or a relaxed evening, Cafe SRT gives you a comfortable place to sit, talk and enjoy your favourites.</p></div><div className="vibe-grid"><article><span>♥</span><h3>Couple Friendly</h3><p>A comfortable setting for coffee dates and shared plates.</p></article><article><span>☕</span><h3>Coffee Dates</h3><p>Slow down with a warm drink and a little time together.</p></article><article><span>♧</span><h3>Friends & Hangouts</h3><p>Meet, talk and keep the plans pleasantly casual.</p></article><article><span>✦</span><h3>Snacks & Meals</h3><p>Fast food favourites and beverages for every craving.</p></article></div></section>
      <section className="experience-section" id="gallery"><div className="section-heading"><p className="eyebrow eyebrow-inline">Your Cafe. Your Time.</p><h2>Come as you are. Stay for the vibe.</h2></div><div className="experience-grid"><article><span>☕</span><h3>Coffee & Conversations</h3><p>A warm pause, a familiar table, a good story.</p></article><article><span>🍕</span><h3>Quick Bites</h3><p>Easy favourites for when hunger has plans.</p></article><article><span>◒</span><h3>Evening Hangouts</h3><p>Meet friends and make an ordinary evening better.</p></article></div></section>
      <section className="preview-section"><div className="section-heading row-between"><div><p className="eyebrow eyebrow-inline">Taste What's Waiting</p><h2>Something for every craving.</h2></div><a className="text-link" href="/order">View full menu →</a></div><div className="category-tiles">{['🍕 Pizza','♟ Burgers','▱ Sandwiches','✦ Fries','☕ Cold Coffee','◒ Mocktails'].map((item) => <a className="category-tile" href="/order" key={item}><span>{item.split(' ')[0]}</span><b>{item.substring(item.indexOf(' ') + 1)}</b><i>↗</i></a>)}</div></section>
      <section className="why-section"><div className="section-heading"><p className="eyebrow eyebrow-inline">Why SRT?</p><h2>The little things matter.</h2></div><div className="why-list"><article><b>01</b><div><h3>Couple Friendly</h3><p>A comfortable cafe for relaxed conversations.</p></div></article><article><b>02</b><div><h3>Easy Ordering</h3><p>Browse the menu and continue directly to WhatsApp.</p></div></article><article><b>03</b><div><h3>Fast-Food Favourites</h3><p>Pizza, burgers, sandwiches, drinks and more.</p></div></article><article><b>04</b><div><h3>Mangalvedha Delivery</h3><p>Good food made easy for your local plans.</p></div></article></div></section>
      <section className="delivery-banner"><div><p className="eyebrow eyebrow-inline">Craving Something Good?</p><h2>Browse Cafe SRT's menu and place your order directly on WhatsApp.</h2></div><div className="cta-row"><a className="primary-btn" href="/order">Browse Menu <span>↗</span></a><a className="tertiary-btn light" href={siteConfig.phoneHref}>Call Cafe</a></div></section>
      <section className="location-section" id="location"><div className="location-copy"><p className="eyebrow eyebrow-inline">Find Cafe SRT</p><h2>Your next good plan is here.</h2><p>{siteConfig.address}</p><ul><li>Hours: Open daily • Closing around {siteConfig.closingTime}</li><li>Phone: <a href={siteConfig.phoneHref}>{siteConfig.phoneDisplay}</a></li></ul><div className="cta-row"><a className="primary-btn" href={siteConfig.googleMapsUrl} target="_blank" rel="noreferrer">Get Directions</a><a className="tertiary-btn" href={siteConfig.phoneHref}>Call</a><a className="tertiary-btn" href={siteConfig.whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a></div></div><div className="location-stamp">CAFE SRT<br /><small>SHIVAJI NAGAR<br />MANGALVEDHA</small></div></section>
      <Footer />
    </main><MobileBar isOrderPage={false} />
  </>
}

function OrderPage() {
  const [menuOpen, setMenuOpen] = useState(false); const [selectedCategory, setSelectedCategory] = useState('All'); const [searchQuery, setSearchQuery] = useState(''); const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null); const [selectedSize, setSelectedSize] = useState<SizeKey>('medium'); const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]); const [quantity, setQuantity] = useState(1)
  const filteredMenu = useMemo(() => menuItems.filter((item) => {
    const normalizedCategory = ['Cold Coffee', 'Mocktails', 'Tea'].includes(item.category) ? 'Drinks' : ['Bhel', 'Momos'].includes(item.category) ? 'Other' : item.category
    return (selectedCategory === 'All' || normalizedCategory === selectedCategory) && item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  }), [selectedCategory, searchQuery])
  const activeProductPrice = selectedProduct?.sizes?.[selectedSize] ?? selectedProduct?.price ?? 0; const activeAddonTotal = (selectedProduct?.addOns ?? []).reduce((sum, addon) => selectedAddOns.includes(addon.name) ? sum + (addon.prices?.[selectedSize] ?? 0) : sum, 0); const hasKnownTotal = selectedProduct?.price != null || Object.values(selectedProduct?.sizes ?? {}).some((value) => typeof value === 'number'); const activeTotal = (activeProductPrice + activeAddonTotal) * quantity
  const openOrder = (item: MenuItem) => { setSelectedProduct(item); setSelectedSize('medium'); setSelectedAddOns([]); setQuantity(1) }
  return <><div className="announcement-bar">☕ Cozy vibes · Good food in Mangalvedha</div><main className="page-shell"><Navbar isOrderPage menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} onMenuClose={() => setMenuOpen(false)} /><section className="order-heading"><a className="back-link" href="/">← Back to Cafe</a><p className="eyebrow">CAFE SRT MENU</p><h1>What are you craving today?</h1><p>Choose your favourites and order directly on WhatsApp.</p></section><section className="order-toolbar"><div className="category-row">{categories.map((category) => <button type="button" key={category} className={`category-chip ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div><label className="search-box"><span>⌕</span><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search pizza, burger, sandwich..." aria-label="Search menu" /></label></section><section className="menu-section order-menu" id="menu"><div className="section-heading"><p className="eyebrow eyebrow-inline">The Cafe Menu</p><h2>Pick your favourites.</h2></div><div className="menu-grid">{filteredMenu.length ? filteredMenu.map((item) => <article className={`menu-card ${item.special ? 'special-card' : ''}`} key={item.id}><button type="button" className="card-image-button" onClick={() => openOrder(item)}><EmptyImage /></button>{item.popular && <span className="badge badge-popular">★ Popular</span>}{item.special && <span className="badge badge-special">SRT Special</span>}<div className="menu-card-body"><p className="menu-category">{item.category}</p><h3>{item.name}</h3>{item.sizes ? <div className="size-prices">{(['small', 'medium', 'large'] as const).map((size) => <span key={size}><small>{size.charAt(0).toUpperCase() + size.slice(1)}</small><b>{item.sizes?.[size] != null ? formatPrice(item.sizes[size] ?? 0) : 'Ask'}</b></span>)}</div> : <div className="single-price">Ask on WhatsApp</div>}<p className="menu-description">{item.description ?? 'A Cafe SRT favourite.'}</p><button type="button" className="small-order" onClick={() => openOrder(item)}>Choose & Order <span>↗</span></button></div></article>) : <div className="empty-state"><h3>No cravings found</h3><p>Try another item or select a different category.</p></div>}</div></section><Footer /></main><MobileBar isOrderPage />{selectedProduct && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="pizza-modal"><button type="button" className="modal-close" onClick={() => setSelectedProduct(null)} aria-label="Close product options">×</button><EmptyImage /><h3>{selectedProduct.name}</h3>{selectedProduct.sizes && <div className="size-selector">{(['small', 'medium', 'large'] as const).map((size) => <button key={size} type="button" className={selectedSize === size ? 'size-button active' : 'size-button'} onClick={() => setSelectedSize(size)}>{size.charAt(0).toUpperCase() + size.slice(1)}<span>{selectedProduct.sizes?.[size] != null ? formatPrice(selectedProduct.sizes[size] ?? 0) : 'Ask'}</span></button>)}</div>}{selectedProduct.addOns?.length ? <div className="addon-list"><h4>Optional add-ons</h4>{selectedProduct.addOns.map((addon) => <label key={addon.name} className="addon-option"><input type="checkbox" checked={selectedAddOns.includes(addon.name)} onChange={() => setSelectedAddOns((current) => current.includes(addon.name) ? current.filter((item) => item !== addon.name) : [...current, addon.name])} /><span>{addon.name}</span><strong>{addon.prices?.[selectedSize] != null ? formatPrice(addon.prices[selectedSize] ?? 0) : 'Ask'}</strong></label>)}</div> : null}<div className="quantity-row"><span>Quantity</span><div><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><strong>{quantity}</strong><button type="button" onClick={() => setQuantity((value) => value + 1)}>+</button></div></div><div className="modal-total"><span>Total</span><strong>{hasKnownTotal ? formatPrice(activeTotal) : 'Ask on WhatsApp'}</strong></div><button type="button" className="primary-btn modal-confirm" onClick={() => window.open(buildOrderLink(selectedProduct, { size: selectedSize, quantity, addOns: selectedAddOns }), '_blank', 'noopener,noreferrer')}>Order on WhatsApp</button></div></div>}</>
}

function Footer() { return <footer className="site-footer" id="contact"><div><div className="brand footer-brand"><img src={logo} alt="Cafe SRT logo" /><span>Cafe SRT</span></div><p>Good food, great vibes and a cozy place in Mangalvedha.</p></div><div><h3>Contact</h3><p>{siteConfig.address}</p><p><a href={siteConfig.phoneHref}>{siteConfig.phoneDisplay}</a></p></div><div><h3>Explore</h3><p><a href="/">Home</a></p><p><a href="/order">Order Food</a></p><p><a href="/#location">Location</a></p></div></footer> }
function MobileBar({ isOrderPage }: { isOrderPage: boolean }) { return <div className="mobile-action-bar">{isOrderPage ? <><a href="/">Home</a><a href="#menu">Menu</a><a href={siteConfig.whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a></> : <><a href={siteConfig.phoneHref}>Call</a><a href={siteConfig.googleMapsUrl} target="_blank" rel="noreferrer">Directions</a><a href="/order">Order Food</a></>}</div> }

export default function App() {
  const isOrderPage = window.location.pathname === '/order' || window.location.pathname.startsWith('/order/')
  useEffect(() => {
    document.title = isOrderPage ? 'Order Food | Cafe SRT Mangalvedha' : 'Cafe SRT Mangalvedha | Couple-Friendly Cafe & Fast Food'
  }, [isOrderPage])
  return isOrderPage ? <OrderPage /> : <HomePage />
}
