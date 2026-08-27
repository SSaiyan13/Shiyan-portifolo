const EMAIL_HREF = 'https://mail.google.com/mail/?view=cm&fs=1&to=shiyan.saiyan13@gmail.com';
const LINKEDIN_HREF = 'https://www.linkedin.com/in/shiyan-gunasegaram/';

export default function Header() {
  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
        padding: '20px clamp(18px,3.2vw,44px)',
        background: 'linear-gradient(180deg,rgba(11,13,12,.72) 0%,rgba(11,13,12,.28) 62%,rgba(11,13,12,0) 100%)',
        backdropFilter: 'blur(12px) saturate(150%)', WebkitBackdropFilter: 'blur(12px) saturate(150%)'
      }}
    >
      <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
        <span
          style={{
            display: 'grid', placeItems: 'center', width: 44, height: 44,
            border: '1px solid rgba(247,240,240,.16)', borderRadius: 2,
            background: 'radial-gradient(120% 120% at 30% 20%,rgba(92,0,41,.55),rgba(11,13,12,.2))',
            fontFamily: "'Bodoni Moda',serif", fontStyle: 'italic', fontSize: 30, lineHeight: 1,
            color: '#E9CDB6', textShadow: '0 0 18px rgba(224,166,190,.45)', paddingBottom: 3
          }}
        >
          S
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 11.5, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F7F0F0' }}>
            Shiyan Gunasegaram
          </span>
          <span data-navsub="" style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#84828F' }}>
            Product · Music Technology
          </span>
        </span>
      </a>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
        <a
          href={EMAIL_HREF}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px',
            border: '1px solid rgba(247,240,240,.14)', borderRadius: 999, fontSize: 10.5,
            letterSpacing: '.16em', textTransform: 'uppercase', background: 'rgba(247,240,240,.03)'
          }}
        >
          Email <span style={{ color: '#84828F' }}>↗</span>
        </a>
        <a
          href={LINKEDIN_HREF}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px',
            border: '1px solid rgba(247,240,240,.14)', borderRadius: 999, fontSize: 10.5,
            letterSpacing: '.16em', textTransform: 'uppercase', background: 'rgba(247,240,240,.03)'
          }}
        >
          LinkedIn <span style={{ color: '#84828F' }}>↗</span>
        </a>
      </nav>
    </header>
  );
}

export { EMAIL_HREF, LINKEDIN_HREF };
