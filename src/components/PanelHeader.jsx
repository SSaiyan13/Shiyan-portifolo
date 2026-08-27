export default function PanelHeader({ label, closeRef, onClose }) {
  return (
    <div
      style={{
        position: 'sticky', top: 0, zIndex: 12, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 16, padding: '16px clamp(18px,3.2vw,44px)',
        background: 'rgba(11,13,12,.42)', backdropFilter: 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: 'blur(18px) saturate(160%)', borderBottom: '1px solid rgba(247,240,240,.1)'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: '#84828F' }}>
        <span style={{ fontFamily: "'Bodoni Moda',serif", fontStyle: 'italic', fontSize: 20, letterSpacing: 0, color: '#E9CDB6', textTransform: 'none' }}>S</span>
        {label}
      </span>
      <button
        ref={closeRef}
        onClick={onClose}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 9, padding: '10px 15px',
          border: '1px solid rgba(247,240,240,.16)', borderRadius: 999, fontSize: 10,
          letterSpacing: '.2em', textTransform: 'uppercase', background: 'rgba(247,240,240,.04)', minHeight: 40
        }}
      >
        Back to room <span style={{ color: '#84828F' }}>✕</span>
      </button>
    </div>
  );
}
