import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, ArrowRight, Wallet, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ nombre: '', email: '', confirmEmail: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                if (formData.email !== formData.confirmEmail) {
                    setError('Los correos electrónicos no coinciden.');
                    setLoading(false);
                    return;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    setError('El correo electrónico no tiene un formato válido.');
                    setLoading(false);
                    return;
                }
                await register(formData.nombre, formData.email, formData.password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-container">
            <div className="logo-container">
                <div className="logo-icon">
                    <Wallet size={36} strokeWidth={2.5} />
                </div>
                <h1 className="logo-text">VaneFi</h1>
            </div>

            <div className="card">
                <h2 className="text-xl mb-4 text-center font-bold">
                    {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                </h2>

                {error && (
                    <div className="error-msg">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="input-group">
                            <label htmlFor="nombre">Nombre</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    className="input-field input-with-icon"
                                    placeholder="Tu nombre completo"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="input-field input-with-icon"
                                placeholder="tu@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <label htmlFor="confirmEmail">Confirmar correo electrónico</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    id="confirmEmail"
                                    name="confirmEmail"
                                    className="input-field input-with-icon"
                                    placeholder="tu@email.com"
                                    value={formData.confirmEmail}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-wrapper" style={{ position: 'relative' }}>
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className="input-field input-with-icon"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-pearl)', padding: 0 }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn mt-4" disabled={loading}>
                        {loading ? 'Cargando...' : isLogin ? 'Ingresar' : 'Registrarse'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? (
                        <p>
                            ¿No tienes cuenta?{' '}
                            <span className="link" onClick={() => setIsLogin(false)}>
                                Regístrate aquí
                            </span>
                        </p>
                    ) : (
                        <p>
                            ¿Ya tienes cuenta?{' '}
                            <span className="link" onClick={() => setIsLogin(true)}>
                                Inicia sesión
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
