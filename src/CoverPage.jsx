export default function CoverPage() {
  return (
    <main className="cahier-shell clean-cahier-shell">
      <section className="cahier-preview-zone">
        <div className="a4-page cahier-page cover-page-only" style={styles.page}>
          <div style={styles.topRightShape} />
          <div style={styles.topRightShape2} />
          <div style={styles.bottomLeftShape} />
          <div style={styles.bottomLeftShape2} />

          <header style={styles.header}>
            <div style={styles.identityBlock}>
              <img
                src="./ministere-maroc.png"
                alt="Ministère de l'Éducation Nationale du Royaume du Maroc"
                style={styles.ministryImage}
              />
            </div>

            <div style={styles.adminBlock}>
              <div><strong>Académie régionale :</strong> <span style={styles.line}>....................................</span></div>
              <div><strong>Direction provinciale :</strong> <span style={styles.line}>................................</span></div>
            </div>
          </header>

          <section style={styles.titleBlock}>
            <h1 style={styles.title}>Cahier de textes</h1>
            <p style={styles.subtitle}>Des professeurs de l’enseignement secondaire qualifiant</p>
          </section>

          <section style={styles.infoBox}>
            <div style={styles.infoRow}><strong>Nom :</strong><span style={styles.fieldLine} /></div>
            <div style={styles.infoRow}><strong>Établissement :</strong><span style={styles.fieldLine} /></div>
            <div style={styles.infoRow}><strong>Classes :</strong><span style={styles.fieldLine} /></div>
          </section>

          <div style={styles.schoolYear}>Année scolaire 2026 / 2027</div>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: '1123px',
    padding: '62px 72px',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#1f1f1f',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    position: 'relative',
    zIndex: 2,
    display: 'grid',
    gridTemplateColumns: '1.15fr 1fr',
    gap: '40px',
    alignItems: 'start'
  },
  identityBlock: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  ministryImage: {
    display: 'block',
    width: '342px',
    maxHeight: '228px',
    marginTop: '60px',
    objectFit: 'contain',
    objectPosition: 'left top'
  },
  adminBlock: {
    display: 'grid',
    gap: '20px',
    paddingTop: '10px',
    fontSize: '17px',
    lineHeight: 1.5
  },
  line: { whiteSpace: 'nowrap', letterSpacing: '1px' },
  titleBlock: {
    position: 'relative',
    zIndex: 2,
    marginTop: '260px',
    textAlign: 'center'
  },
  title: {
    margin: 0,
    color: '#4b145f',
    fontSize: '64px',
    fontWeight: 900,
    lineHeight: 1,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  subtitle: {
    maxWidth: '700px',
    margin: '24px auto 0',
    color: '#202020',
    fontSize: '28px',
    fontWeight: 800,
    lineHeight: 1.25
  },
  infoBox: {
    position: 'relative',
    zIndex: 2,
    width: '72%',
    margin: '115px auto 0',
    display: 'grid',
    gap: '26px',
    padding: '28px 34px',
    border: '2px solid rgba(75, 20, 95, 0.28)',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.9)'
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '150px 1fr',
    alignItems: 'end',
    fontSize: '20px'
  },
  fieldLine: {
    display: 'block',
    height: '24px',
    borderBottom: '2px dotted #444'
  },
  schoolYear: {
    position: 'absolute',
    right: '52px',
    bottom: '42px',
    zIndex: 2,
    padding: '12px 20px',
    borderRadius: '999px',
    color: '#4b145f',
    fontSize: '18px',
    fontWeight: 900,
    border: '2px solid rgba(75, 20, 95, 0.35)',
    background: '#fff'
  },
  topRightShape: {
    position: 'absolute',
    top: '-30px',
    right: '-55px',
    width: '360px',
    height: '260px',
    background: '#4b145f',
    clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 0 45%)',
    opacity: 0.95
  },
  topRightShape2: {
    position: 'absolute',
    top: '35px',
    right: '95px',
    width: '210px',
    height: '170px',
    background: '#8b2a8f',
    clipPath: 'polygon(50% 0, 100% 100%, 0 75%)',
    opacity: 0.9
  },
  bottomLeftShape: {
    position: 'absolute',
    left: '-65px',
    bottom: '-65px',
    width: '360px',
    height: '300px',
    background: '#4b145f',
    clipPath: 'polygon(0 0, 100% 35%, 55% 100%, 0 100%)'
  },
  bottomLeftShape2: {
    position: 'absolute',
    left: '95px',
    bottom: '20px',
    width: '220px',
    height: '190px',
    background: '#9f2b8e',
    clipPath: 'polygon(50% 0, 100% 100%, 0 75%)',
    opacity: 0.9
  }
};