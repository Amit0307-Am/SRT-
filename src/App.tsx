import { useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import './App.css'
import logo from './assets/logo-image.webp'
import { siteConfig } from './config/site'
import { categories, menuItems, type MenuItem } from './data/menu'

type SizeKey = 'small' | 'medium' | 'large'
type PaymentMethod = 'UPI' | 'COD'
type FlowStep = 'summary' | 'details' | 'payment' | 'share'

type GeoDetails = {
  latitude: number | null
  longitude: number | null
  mapsUrl: string | null
  status: string
  error: string | null
}

const formatPrice = (value: number) => `₹${value}`
const formatSizeLabel = (size: SizeKey) => size.charAt(0).toUpperCase() + size.slice(1)
const createOrderId = () => `${siteConfig.payment.transactionPrefix}${Date.now().toString().slice(-6)}`

const getPaymentAmount = (orderTotal: number) =>
  siteConfig.payment.testMode ? siteConfig.payment.testAmount : orderTotal

const buildUpiUri = (amount: number, orderId: string) => {
  const params = new URLSearchParams({
    pa: siteConfig.payment.upiId,
    pn: siteConfig.payment.payeeName,
    am: String(amount),
    cu: 'INR',
    tn: `${siteConfig.name} Order ${orderId}`,
  })

  return `upi://pay?${params.toString()}`
}

const buildWhatsAppLink = (text: string) =>
  `${siteConfig.whatsappLink}?text=${encodeURIComponent(text)}`

const buildOrderMessage = ({
  item,
  size,
  quantity,
  addOns,
  paymentMethod,
  orderId,
  customerName,
  customerPhone,
  deliveryAddress,
  currentLocation,
  orderTotal,
}: {
  item: MenuItem
  size: SizeKey
  quantity: number
  addOns: string[]
  paymentMethod: PaymentMethod
  orderId: string
  customerName: string
  customerPhone: string
  deliveryAddress: string
  currentLocation: GeoDetails
  orderTotal: number
}) => {
  const orderLines = [
    'Hello Cafe SRT 👋',
    '',
    `New Order #${orderId}`,
    '',
    'Customer:',
    customerName || 'Amit',
    'Phone:',
    customerPhone || '9876543210',
    '',
    '🍕 ' + item.name,
    `Size: ${formatSizeLabel(size)}`,
    ...(addOns.length ? [`Add-on: ${addOns.join(', ')}`] : []),
    `Quantity: ${quantity}`,
    '',
    `Order Total: ${formatPrice(orderTotal)}`,
    `Payment Method: ${paymentMethod === 'UPI' ? 'UPI' : 'Cash on Delivery'}`,
    '',
    'Delivery Address:',
    deliveryAddress || 'Address not entered',
    '',
    '📍 Current Location:',
    currentLocation.mapsUrl || 'Current location not provided',
    '',
    'Please confirm my order.',
  ]

  return orderLines.join('\n')
}

function Navbar({ isOrderPage, menuOpen, onMenuToggle, onMenuClose }: { isOrderPage: boolean; menuOpen: boolean; onMenuToggle: () => void; onMenuClose: () => void }) {
  useEffect(() => {
    if (!menuOpen) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onMenuClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen, onMenuClose])

  const closeAfterNavigation = () => onMenuClose()

  return (
    <>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Cafe SRT home">
          <img src={logo} alt="Cafe SRT logo" />
          <span>Cafe SRT</span>
        </a>
        <button type="button" className="menu-toggle" onClick={onMenuToggle} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
          {menuOpen ? '×' : '☰'}
        </button>
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <a href={isOrderPage ? '/' : '#home'} onClick={closeAfterNavigation}>Home</a>
          <a href={isOrderPage ? '/#about' : '#about'} onClick={closeAfterNavigation}>About</a>
          <a href={isOrderPage ? '/#gallery' : '#gallery'} onClick={closeAfterNavigation}>Gallery</a>
          <a href={isOrderPage ? '/#location' : '#location'} onClick={closeAfterNavigation}>Location</a>
          <a href={isOrderPage ? '/#contact' : '#contact'} onClick={closeAfterNavigation}>Contact</a>
        </nav>
        <a className={`nav-cta ${isOrderPage ? 'active' : ''}`} href="/order" onClick={closeAfterNavigation}>🍔 Order Food</a>
      </header>
      {menuOpen && <button type="button" className="mobile-menu-backdrop" aria-label="Close menu" onClick={onMenuClose} />}
    </>
  )
}

function EmptyImage({ label = 'Food illustration' }: { label?: string }) {
  return (
    <div className="empty-image" aria-label={label}>
      <span>✦</span>
      <small>made fresh</small>
    </div>
  )
}

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <div className="announcement-bar">❤️ Couple Friendly • Cozy Cafe • Mangalvedha</div>
      <main className="page-shell">
        <Navbar isOrderPage={false} menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} onMenuClose={() => setMenuOpen(false)} />
        <section className="hero home-hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">CAFE SRT • MANGALVEDHA</p>
            <div className="premium-badge">♥ Couple Friendly</div>
            <h1>
              Good Food.<br />
              Great Vibes.<br />
              <em>Better Together.</em>
            </h1>
            <p className="hero-subtitle">Your cozy spot in Mangalvedha for coffee dates, casual hangouts and delicious bites.</p>
            <div className="cta-row">
              <a href="/order" className="primary-btn">
                Order Food <span>↗</span>
              </a>
              <a href="#location" className="tertiary-btn">
                Find Us
              </a>
            </div>
            <div className="hero-meta">
              <span>♥ Couple Friendly</span>
              <span>☕ Cozy Vibes</span>
              <span>✦ Fresh Bites</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="cafe-placeholder" aria-label="Cafe SRT cafe illustration">
              <span className="cafe-mark">SRT</span>
              <small>Eat · Sip · Relax</small>
              <i className="steam steam-one" />
              <i className="steam steam-two" />
            </div>
            <div className="hero-sticker" aria-label="Cafe SRT Mangalvedha stamp">
              <strong>CAFE SRT</strong>
              <span>MANGALVEDHA</span>
              <small>• SIP · EAT · RELAX •</small>
            </div>
            <div className="small-card">
              <div className="small-card-badge">Good conversations live here</div>
              <p>A comfortable place for coffee dates, relaxed conversations and casual hangouts.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

function OrderPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null)
  const [selectedSize, setSelectedSize] = useState<SizeKey>('medium')
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [currentStep, setCurrentStep] = useState<FlowStep>('summary')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI')
  const [orderId, setOrderId] = useState(() => createOrderId())
  const [geoDetails, setGeoDetails] = useState<GeoDetails>({
    latitude: null,
    longitude: null,
    mapsUrl: null,
    status: 'Not added',
    error: null,
  })
  const [shareStatus, setShareStatus] = useState('Choose WhatsApp to share your order')
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const filteredMenu = useMemo(
    () =>
      menuItems.filter((item) => {
        const category = ['Cold Coffee', 'Mocktails', 'Tea'].includes(item.category)
          ? 'Drinks'
          : ['Bhel', 'Momos'].includes(item.category)
            ? 'Other'
            : item.category

        return (selectedCategory === 'All' || category === selectedCategory) && item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      }),
    [selectedCategory, searchQuery],
  )

  const activeProductPrice = selectedProduct?.sizes?.[selectedSize] ?? selectedProduct?.price ?? 0
  const activeAddonTotal = (selectedProduct?.addOns ?? []).reduce((sum, addon) => {
    if (!selectedAddOns.includes(addon.name)) return sum
    return sum + (addon.prices?.[selectedSize] ?? 0)
  }, 0)

  const activeTotal = (activeProductPrice + activeAddonTotal) * quantity
  const paymentAmount = getPaymentAmount(activeTotal)
  const upiUri = selectedProduct ? buildUpiUri(paymentAmount, orderId) : ''

  const startOrder = (item: MenuItem) => {
    setSelectedProduct(item)
    setSelectedSize('medium')
    setSelectedAddOns([])
    setQuantity(1)
    setCurrentStep('summary')
    setCustomerName('')
    setCustomerPhone('')
    setDeliveryAddress('')
    setPaymentMethod('UPI')
    setGeoDetails({ latitude: null, longitude: null, mapsUrl: null, status: 'Not added', error: null })
    setShareStatus('Choose WhatsApp to share your order')
    setOrderId(createOrderId())
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoDetails({
        latitude: null,
        longitude: null,
        mapsUrl: null,
        status: 'Browser not supported',
        error: "We couldn't access your current location. Please enter your delivery address manually.",
      })
      return
    }

    setGeoDetails((previous) => ({ ...previous, status: 'Requesting current location...', error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`

        setGeoDetails({ latitude, longitude, mapsUrl, status: 'Location added ✓', error: null })
      },
      () => {
        setGeoDetails({
          latitude: null,
          longitude: null,
          mapsUrl: null,
          status: 'Could not access current location',
          error: "We couldn't access your current location. Please enter your delivery address manually.",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    )
  }

  const orderMessage = selectedProduct
    ? buildOrderMessage({
        item: selectedProduct,
        size: selectedSize,
        quantity,
        addOns: selectedAddOns,
        paymentMethod,
        orderId,
        customerName,
        customerPhone,
        deliveryAddress,
        currentLocation: geoDetails,
        orderTotal: activeTotal,
      })
    : ''

  const exportQrAsPng = async () => {
    const canvas = qrCanvasRef.current
    if (!canvas) return null

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png', 1)
    })
  }

  const shareTextOnlyOnWhatsApp = () => {
    window.open(buildWhatsAppLink(orderMessage), '_blank', 'noopener,noreferrer')
    setShareStatus('WhatsApp opened. Choose your contact to share your order.')
  }

  const shareOrderWithSystemSheet = async () => {
    const qrBlob = await exportQrAsPng()
    const qrFile = qrBlob ? new File([qrBlob], `cafe-srt-order-${orderId}.png`, { type: 'image/png' }) : null

    if (typeof navigator !== 'undefined' && 'share' in navigator && qrFile && navigator.canShare?.({ files: [qrFile] })) {
      try {
        await navigator.share({
          files: [qrFile],
          text: orderMessage,
        })
        setShareStatus('Share sheet opened. Choose WhatsApp to continue.')
        return
      } catch (error) {
        const typedError = error as { name?: string }
        if (typedError.name === 'AbortError') {
          setShareStatus('Share cancelled. You can retry anytime.')
          return
        }
      }
    }

    setShareStatus('System share is not available on this browser. Use the direct WhatsApp button below.')
  }

  const canContinueToPayment = Boolean(selectedProduct && customerName.trim() && customerPhone.trim())

  return (
    <>
      <div className="announcement-bar">☕ Cozy vibes · Good food in Mangalvedha</div>
      <main className="page-shell">
        <Navbar isOrderPage menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} onMenuClose={() => setMenuOpen(false)} />

        <section className="order-heading">
          <a className="back-link" href="/">← Back to Cafe</a>
          <p className="eyebrow">CAFE SRT MENU</p>
          <h1>What are you craving today?</h1>
          <p>Choose your favourites and complete the order in a simple checkout flow.</p>
        </section>

        {!selectedProduct && (
          <div className="product-selection-panel">
            <section className="order-toolbar">
              <div className="category-row">
                {categories.map((category) => (
                  <button type="button" key={category} className={`category-chip ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>
                    {category}
                  </button>
                ))}
              </div>
              <label className="search-box">
                <span>⌕</span>
                <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search pizza, burger, sandwich..." aria-label="Search menu" />
              </label>
            </section>

            <section className="menu-section order-menu" id="menu">
              <div className="section-heading">
                <p className="eyebrow eyebrow-inline">The Cafe Menu</p>
                <h2>Pick your favourites.</h2>
              </div>

              <div className="menu-grid">
                {filteredMenu.length ? (
                  filteredMenu.map((item) => (
                    <article className={`menu-card ${item.special ? 'special-card' : ''}`} key={item.id}>
                      <button type="button" className="card-image-button" onClick={() => startOrder(item)}>
                        <EmptyImage />
                      </button>
                      {item.popular && <span className="badge badge-popular">★ Popular</span>}
                      {item.special && <span className="badge badge-special">SRT Special</span>}
                      <div className="menu-card-body">
                        <p className="menu-category">{item.category}</p>
                        <h3>{item.name}</h3>
                        {item.sizes ? (
                          <div className="size-prices">
                            {(['small', 'medium', 'large'] as const).map((size) => (
                              <span key={size}>
                                <small>{formatSizeLabel(size)}</small>
                                <b>{item.sizes?.[size] != null ? formatPrice(item.sizes[size] ?? 0) : 'Ask'}</b>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="single-price">{item.price ? formatPrice(item.price) : 'Ask on WhatsApp'}</div>
                        )}
                        <p className="menu-description">{item.description ?? 'Freshly made at Cafe SRT.'}</p>
                        <button type="button" className="small-order" onClick={() => startOrder(item)}>
                          Add to order
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">No items match your search.</div>
                )}
              </div>
            </section>
          </div>
        )}

        {selectedProduct && (
          <div className="checkout-container">
            <div className="checkout-main">
              {currentStep === 'summary' && (
                <div className="checkout-panel">
                  <div className="panel-header">
                    <p className="eyebrow eyebrow-inline">Step 1</p>
                    <h2>Your Order</h2>
                  </div>

                  <div className="product-config-card">
                    <div className="selected-product-header">
                      <div>
                        <p className="menu-category">{selectedProduct.category}</p>
                        <h3>{selectedProduct.name}</h3>
                      </div>
                      <button type="button" className="tertiary-btn slim" onClick={() => setSelectedProduct(null)}>
                        Change Item
                      </button>
                    </div>

                    {selectedProduct.sizes && (
                      <div className="size-picker">
                        <label>Size</label>
                        <div className="segmented-control">
                          {(['small', 'medium', 'large'] as const).map((size) => (
                            <button type="button" key={size} className={selectedSize === size ? 'active' : ''} onClick={() => setSelectedSize(size)}>
                              {formatSizeLabel(size)}
                              <span>{selectedProduct.sizes?.[size] ? formatPrice(selectedProduct.sizes[size] ?? 0) : 'Ask'}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProduct.addOns && selectedProduct.addOns.length > 0 && (
                      <div className="addons-picker">
                        <label>Add-ons</label>
                        <div className="addon-list">
                          {selectedProduct.addOns.map((addon) => (
                            <label key={addon.name} className={`addon-option ${selectedAddOns.includes(addon.name) ? 'checked' : ''}`}>
                              <input
                                type="checkbox"
                                checked={selectedAddOns.includes(addon.name)}
                                onChange={() => {
                                  setSelectedAddOns((current) =>
                                    current.includes(addon.name) ? current.filter((item) => item !== addon.name) : [...current, addon.name],
                                  )
                                }}
                              />
                              <span>{addon.name}</span>
                              <strong>{addon.prices?.[selectedSize] ? formatPrice(addon.prices[selectedSize] ?? 0) : 'Included'}</strong>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="quantity-row">
                      <label>Quantity</label>
                      <div className="qty-box">
                        <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                          −
                        </button>
                        <span>{quantity}</span>
                        <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="checkout-actions">
                    <button type="button" className="primary-btn" onClick={() => setCurrentStep('details')}>
                      Continue to Customer Details
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'details' && (
                <div className="checkout-panel">
                  <div className="panel-header">
                    <p className="eyebrow eyebrow-inline">Step 2</p>
                    <h2>Delivery Details</h2>
                  </div>

                  <div className="customer-form">
                    <label>
                      Customer Name
                      <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Enter your name" />
                    </label>

                    <label>
                      Customer Phone
                      <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Enter your phone number" />
                    </label>

                    <label>
                      Delivery Address
                      <textarea value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Apartment, street, area, landmark" rows={3} />
                    </label>

                    <div className="location-row">
                      <button type="button" className="secondary-btn" onClick={handleUseCurrentLocation}>
                        Use Current Location
                      </button>
                      {geoDetails.mapsUrl && (
                        <a href={geoDetails.mapsUrl} target="_blank" rel="noreferrer" className="text-link inline-link">
                          View on Map
                        </a>
                      )}
                    </div>

                    {geoDetails.status && <p className="location-state">{geoDetails.status}</p>}
                    {geoDetails.error && <p className="location-error">{geoDetails.error}</p>}
                  </div>

                  <div className="checkout-actions split-actions">
                    <button type="button" className="tertiary-btn" onClick={() => setCurrentStep('summary')}>
                      Back
                    </button>
                    <button type="button" className="primary-btn" disabled={!canContinueToPayment} onClick={() => setCurrentStep('payment')}>
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'payment' && (
                <div className="checkout-panel">
                  <div className="panel-header">
                    <p className="eyebrow eyebrow-inline">Step 3</p>
                    <h2>Payment</h2>
                  </div>

                  <div className="payment-methods">
                    <button type="button" className={`payment-method-card ${paymentMethod === 'UPI' ? 'active' : ''}`} onClick={() => setPaymentMethod('UPI')}>
                      <strong>UPI</strong>
                      <span>Pay digitally through UPI</span>
                    </button>
                    <button type="button" className={`payment-method-card ${paymentMethod === 'COD' ? 'active' : ''}`} onClick={() => setPaymentMethod('COD')}>
                      <strong>Cash on Delivery</strong>
                      <span>Pay when your order arrives</span>
                    </button>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="qr-panel">
                      <p className="order-total-inline">
                        Order Total <strong>{formatPrice(activeTotal)}</strong>
                      </p>
                      <div className="qr-wrap">
                        <QRCodeCanvas ref={qrCanvasRef} value={upiUri} size={800} bgColor="#ffffff" fgColor="#211a17" level="M" includeMargin />
                      </div>
                      <p className="scan-note">Scan this QR using any UPI app.</p>
                      <p className="upi-payee">Pay to: <strong>{siteConfig.payment.payeeName}</strong></p>
                      <p className="upi-payee">UPI: <strong>{siteConfig.payment.upiId}</strong></p>
                    </div>
                  )}

                  {paymentMethod === 'COD' && (
                    <div className="cod-panel">
                      <p>
                        Payment Method: <strong>Cash on Delivery</strong>
                      </p>
                      <p>
                        Amount Payable: <strong>{formatPrice(activeTotal)}</strong>
                      </p>
                    </div>
                  )}

                  <div className="checkout-actions split-actions">
                    <button type="button" className="tertiary-btn" onClick={() => setCurrentStep('details')}>
                      Back
                    </button>
                    <button type="button" className="primary-btn" disabled={!canContinueToPayment} onClick={() => setCurrentStep('share')}>
                      Continue to Share Order
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'share' && (
                <div className="checkout-panel">
                  <div className="panel-header">
                    <p className="eyebrow eyebrow-inline">Step 4</p>
                    <h2>Share Order</h2>
                  </div>

                  <div className="share-summary">
                    <p className="share-summary-heading">Your order is ready to share.</p>
                    <div className="share-preview-block">
                      <pre>{orderMessage}</pre>
                    </div>
                  </div>

                  <div className="share-actions">
                    <button type="button" className="primary-btn" onClick={shareOrderWithSystemSheet}>
                      Share Order + QR
                    </button>
                    <button type="button" className="secondary-btn" onClick={shareTextOnlyOnWhatsApp}>
                      Send Details on WhatsApp
                    </button>
                  </div>

                  <p className="share-status">{shareStatus}</p>
                </div>
              )}
            </div>

            <aside className="checkout-sidebar">
              <div className="summary-card">
                <p className="eyebrow eyebrow-inline">Order Summary</p>
                <h3>{selectedProduct.name}</h3>

                <div className="summary-row">
                  <span>Size</span>
                  <strong>{formatSizeLabel(selectedSize)}</strong>
                </div>
                <div className="summary-row">
                  <span>Quantity</span>
                  <strong>{quantity}</strong>
                </div>
                {selectedAddOns.length > 0 && (
                  <div className="summary-row">
                    <span>Add-ons</span>
                    <strong>{selectedAddOns.join(', ')}</strong>
                  </div>
                )}
                <div className="summary-row total-row">
                  <span>Order Total</span>
                  <strong>{formatPrice(activeTotal)}</strong>
                </div>
                {paymentMethod === 'UPI' && (
                  <div className="summary-row">
                    <span>Payment Amount</span>
                    <strong>{formatPrice(paymentAmount)}</strong>
                  </div>
                )}
                {geoDetails.mapsUrl && (
                  <div className="summary-row location-summary-row">
                    <span>Current Location</span>
                    <a href={geoDetails.mapsUrl} target="_blank" rel="noreferrer">
                      View on Map
                    </a>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  )
}

export default function App() {
  const isOrderPage = window.location.pathname === '/order' || window.location.pathname.startsWith('/order/')

  useEffect(() => {
    document.title = isOrderPage ? 'Order Food | Cafe SRT Mangalvedha' : 'Cafe SRT Mangalvedha | Couple-Friendly Cafe & Fast Food'
  }, [isOrderPage])

  return isOrderPage ? <OrderPage /> : <HomePage />
}
