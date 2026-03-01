import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, ShieldCheck, ArrowRight, BarChart3 } from 'lucide-react';

export default function Landing() {
    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Navigation */}
            <nav style={{ padding: '2rem 10%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--color-purple), #8a6ef5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wallet size={24} color="white" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>VaneFi</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/login" className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem' }}>
                        Ingresar
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 10%', textAlign: 'center' }}>
                <span className="fade-in-up" style={{ padding: '0.5rem 1rem', borderRadius: 20, border: '1px solid rgba(177, 174, 187, 0.2)', color: 'var(--color-pearl)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                    Plataforma de Control Financiero
                </span>

                <h1 className="fade-in-up delay-1" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: '800px' }}>
                    Toma el control de tu <br />
                    <span className="gradient-text-purple">futuro financiero</span>
                </h1>

                <p className="fade-in-up delay-2 text-pearl" style={{ fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', lineHeight: 1.6 }}>
                    VaneFi te ayuda a organizar tus ingresos, proyectar tus gastos y alcanzar tus metas de ahorro sin fricción. Inteligencia financiera en la palma de tu mano.
                </p>

                <div className="fade-in-up delay-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/login" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                        Comenzar ahora
                        <ArrowRight size={20} />
                    </Link>
                </div>

                {/* Features Preview */}
                <div className="fade-in-up delay-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '6rem', width: '100%', maxWidth: '1200px', textAlign: 'left' }}>

                    <div className="card" style={{ background: 'linear-gradient(180deg, var(--color-martinique), rgba(58, 49, 83, 0.3))' }}>
                        <div style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(95, 67, 178, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <TrendingUp size={24} className="text-purple" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Alertas Inteligentes</h3>
                        <p className="text-pearl" style={{ lineHeight: 1.6 }}>Mantén tus gastos controlados. VaneFi te avisa automáticamente cuando estés cerca de alcanzar el 80% de tu presupuesto mensual.</p>
                    </div>

                    <div className="card" style={{ background: 'linear-gradient(180deg, var(--color-martinique), rgba(58, 49, 83, 0.3))' }}>
                        <div style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(46, 213, 115, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <BarChart3 size={24} className="text-success" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Pronóstico Estadístico</h3>
                        <p className="text-pearl" style={{ lineHeight: 1.6 }}>Nuestro motor analiza tu historial de consumo y proyecta un gasto estimado para que no te lleves sorpresas al final del mes.</p>
                    </div>

                    <div className="card" style={{ background: 'linear-gradient(180deg, var(--color-martinique), rgba(58, 49, 83, 0.3))' }}>
                        <div style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(234, 76, 137, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <ShieldCheck size={24} className="text-danger" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Retención Protegida</h3>
                        <p className="text-pearl" style={{ lineHeight: 1.6 }}>Define una reserva intocable de tu ingreso mensual para garantizar tu fondo de ahorro o cobertura de emergencias de forma pasiva.</p>
                    </div>

                </div>
            </main>

            <footer style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-pearl)', borderTop: '1px solid rgba(177, 174, 187, 0.1)', marginTop: '4rem' }}>
                <p>© 2026 VaneFi. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
