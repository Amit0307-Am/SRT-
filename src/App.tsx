import './App.css'
import brandLogo from './assets/logo-image.webp'
import heroFood from './assets/dishes.webp'

const whatsappUrl =
  'https://wa.me/919008197009?text=' +
  encodeURIComponent(`Hi Cafe SRT 👋\n\nI would like to order:\n\n🍕 Item: Paneer Tikka Pizza\n📏 Size: Medium\n🔢 Quantity: 1\n💰 Total: ₹250\n\n📍 Delivery: Mangalvedha\n\nPlease confirm availability and delivery time.\n\nThank you!`)

function App() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand" aria-label="Cafe SRT home">
          <img src={brandLogo} alt="Cafe SRT logo" />
          <span>Cafe SRT</span>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#menu">Menu</a>
          <a href="#popular">Popular</a>
          <a href="#location">Location</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="nav-cta" href={whatsappUrl} target="_blank" rel="noreferrer">
          Order on WhatsApp
        </a>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">CAFE SRT • MANGALVEDHA</p>

          <div className="premium-badge">❤️ Couple Friendly • Cozy Cafe • Mangalvedha</div>

          <div className="floating-pill">❤️ Couple Friendly • Cozy Vibes</div>

          <h1>Good Food. Great Vibes. Better Together.</h1>

          <p className="hero-subtitle">
            Enjoy pizzas, burgers, coffee and more in a cozy couple-friendly atmosphere — or order your favourites directly on WhatsApp.
          </p>

          <div className="cta-row">
            <a href="#menu" className="primary-btn">
              Explore Menu
            </a>
            <a href={whatsappUrl} className="secondary-btn" target="_blank" rel="noreferrer">
              Order on WhatsApp
            </a>
          </div>

          <div className="hero-meta" aria-label="Cafe features">
            <span>Fast Delivery</span>
            <span>Freshly Prepared</span>
            <span>Mangalvedha</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Cafe food highlight">
          <div className="food-card large-card">
            <img src={heroFood} alt="Cafe SRT food platter" />
          </div>

          <div className="food-card small-card">
            <div className="small-card-badge">❤️ Couple Friendly</div>
            <p>
              A comfortable spot for coffee dates, casual meetups and relaxed hangouts.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
