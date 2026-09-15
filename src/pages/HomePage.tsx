import { useState } from 'react'
import '../customer.css'
import logo from '../assets/logo-image.webp'
import { siteConfig } from '../config/site'

function Navbar({ menuOpen, onMenuToggle }: { menuOpen: boolean; onMenuToggle: () => void }) {
  return <header className="topbar">
    <a className="brand" href="/" aria-label="Cafe SRT home"><img src={logo} alt="Cafe SRT logo" /><span>Cafe SRT</span></a>
    <button type="button" className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle navigation menu" aria-expanded={menuOpen}>{menuOpen ? '×' : '☰'}</button>
    <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
      <a href="#home">Home</a><a href="#about">About</a><a href="#gallery">Gallery</a><a href="#location">Location</a><a href="#contact">Contact</a>
    </nav>
    <a className="nav-cta" href="/order">🍔 Order Food</a>
  </header>
}

function CafePlaceholder() { return <div className="cafe-placeholder" aria-label="Cafe SRT cafe illustration"><span className="cafe-mark">SRT</span><small>Eat · Sip · Relax</small><i className="steam steam-one" /><i className="steam steam-two" /></div> }

function Footer() { return <footer className="site-footer" id="contact"><div><div className="brand footer-brand"><img src={logo} alt="Cafe SRT logo" /><span>Cafe SRT</span></div><p>Good food, great vibes and a cozy place in Mangalvedha.</p></div><div><h3>Contact</h3><p>{siteConfig.address}</p><p><a href={siteConfig.phoneHref}>{siteConfig.phoneDisplay}</a></p></div><div><h3>Explore</h3><p><a href="/">Home</a></p><p><a href="/order">Order Food</a></p><p><a href="/#location">Location</a></p></div></footer> }
function MobileBar() { return <div className="mobile-action-bar"><a href={siteConfig.phoneHref}>Call</a><a href={siteConfig.googleMapsUrl} target="_blank" rel="noreferrer">Directions</a><a href="/order">Order Food</a></div> }

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <>
    <div className="announcement-bar">♥ Couple Friendly • Cozy Cafe • Mangalvedha</div>
    <main className="page-shell"><Navbar menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />
      <section className="hero home-hero" id="home"><div className="hero-copy"><p className="eyebrow">CAFE SRT • MANGALVEDHA</p><div className="premium-badge">♥ Couple Friendly</div><h1>Good Food.<br />Great Vibes.<br /><em>Better Together.</em></h1><p className="hero-subtitle">Your cozy spot in Mangalvedha for coffee dates, casual hangouts and delicious bites.</p><div className="cta-row"><a href="/order" className="primary-btn">Order Food <span>↗</span></a><a href="#location" className="tertiary-btn">Find Us</a></div><div className="hero-meta"><span>♥ Couple Friendly</span><span>☕ Cozy Vibes</span><span>✦ Fresh Bites</span></div></div><div className="hero-visual"><CafePlaceholder /><div className="hero-sticker">MANGALVEDHA<br /><b>since your<br />next coffee date</b></div><div className="small-card"><div className="small-card-badge">Good conversations live here</div><p>A comfortable place for coffee dates, relaxed conversations and casual hangouts.</p></div></div></section>
      <section className="experience-strip" aria-label="Cafe experience"><span>♥ <b>Couple Friendly</b></span><span>☕ <b>Cozy Atmosphere</b></span><span>✦ <b>Delicious Bites</b></span><span>⌖ <b>Mangalvedha</b></span></section>
      <section className="about-section split-section" id="about"><div><p className="eyebrow eyebrow-inline">About Cafe SRT</p><h2>A relaxed corner in Mangalvedha.</h2></div><div><p>Cafe SRT brings fast food, beverages and an easygoing cafe environment together in Shivaji Nagar, Mangalvedha.</p><p>Come by for a casual hangout, a coffee date or a quick bite. Delivery is available across Mangalvedha.</p><a className="text-link" href="#location">Find the cafe →</a></div></section>
      <section className="vibe-section"><div className="section-heading"><p className="eyebrow eyebrow-inline">Good Vibes</p><h2>Made for good conversations.</h2><p className="section-lede">Whether it is a coffee date, catching up with friends or a relaxed evening, Cafe SRT gives you a comfortable place to sit, talk and enjoy your favourites.</p></div><div className="vibe-grid"><article><span>♥</span><h3>Couple Friendly</h3><p>A comfortable setting for coffee dates and shared plates.</p></article><article><span>☕</span><h3>Coffee Dates</h3><p>Slow down with a warm drink and a little time together.</p></article><article><span>♧</span><h3>Friends &amp; Hangouts</h3><p>Meet, talk and keep the plans pleasantly casual.</p></article><article><span>✦</span><h3>Snacks &amp; Meals</h3><p>Fast food favourites and beverages for every craving.</p></article></div></section>
      <section className="experience-section" id="gallery"><div className="section-heading"><p className="eyebrow eyebrow-inline">Your Cafe. Your Time.</p><h2>Come as you are. Stay for the vibe.</h2></div><div className="experience-grid"><article><span>☕</span><h3>Coffee &amp; Conversations</h3><p>A warm pause, a familiar table, a good story.</p></article><article><span>🍕</span><h3>Quick Bites</h3><p>Easy favourites for when hunger has plans.</p></article><article><span>◒</span><h3>Evening Hangouts</h3><p>Meet friends and make an ordinary evening better.</p></article></div></section>
      <section className="preview-section"><div className="section-heading row-between"><div><p className="eyebrow eyebrow-inline">Taste What is Waiting</p><h2>Something for every craving.</h2></div><a className="text-link" href="/order">View full menu →</a></div><div className="category-tiles">{['🍕 Pizza','♟ Burgers','▱ Sandwiches','✦ Fries','☕ Cold Coffee','◒ Mocktails'].map((item) => <a className="category-tile" href="/order" key={item}><span>{item.split(' ')[0]}</span><b>{item.substring(item.indexOf(' ') + 1)}</b><i>↗</i></a>)}</div></section>
      <section className="why-section"><div className="section-heading"><p className="eyebrow eyebrow-inline">Why SRT?</p><h2>The little things matter.</h2></div><div className="why-list"><article><b>01</b><div><h3>Couple Friendly</h3><p>A comfortable cafe for relaxed conversations.</p></div></article><article><b>02</b><div><h3>Easy Ordering</h3><p>Browse the menu and continue directly to WhatsApp.</p></div></article><article><b>03</b><div><h3>Fast-Food Favourites</h3><p>Pizza, burgers, sandwiches, drinks and more.</p></div></article><article><b>04</b><div><h3>Mangalvedha Delivery</h3><p>Good food made easy for your local plans.</p></div></article></div></section>
      <section className="delivery-banner"><div><p className="eyebrow eyebrow-inline">Craving Something Good?</p><h2>Browse Cafe SRT&apos;s menu and place your order directly on WhatsApp.</h2></div><div className="cta-row"><a className="primary-btn" href="/order">Browse Menu <span>↗</span></a><a className="tertiary-btn light" href={siteConfig.phoneHref}>Call Cafe</a></div></section>
      <section className="location-section" id="location"><div className="location-copy"><p className="eyebrow eyebrow-inline">Find Cafe SRT</p><h2>Your next good plan is here.</h2><p>{siteConfig.address}</p><ul><li>Hours: Open daily • Closing around {siteConfig.closingTime}</li><li>Phone: <a href={siteConfig.phoneHref}>{siteConfig.phoneDisplay}</a></li></ul><div className="cta-row"><a className="primary-btn" href={siteConfig.googleMapsUrl} target="_blank" rel="noreferrer">Get Directions</a><a className="tertiary-btn" href={siteConfig.phoneHref}>Call</a><a className="tertiary-btn" href={siteConfig.whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a></div></div><div className="location-stamp">CAFE SRT<br /><small>SHIVAJI NAGAR<br />MANGALVEDHA</small></div></section>
      <Footer />
    </main><MobileBar />
  </>
}
