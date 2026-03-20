import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Calendar as CalendarIcon, Wallet, FileText, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity, Trash2, ChevronRight, ChevronLeft, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
    const { api, logout } = useAuth();
    const navigate = useNavigate();

    const [currentView, setCurrentView] = useState('resumen');
    const [months, setMonths] = useState([]);
    const [activeMonthId, setActiveMonthId] = useState(null);

    const [summary, setSummary] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Calendar State
    const [activeDate, setActiveDate] = useState(new Date());
    const [listScope, setListScope] = useState('mes');

    // Forms states
    const [showNewMonthObj, setShowNewMonthObj] = useState(false);
    const [newMonthForm, setNewMonthForm] = useState({
        anio: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        ingreso_mensual: '',
        retencion: ''
    });

    const [showNewExpense, setShowNewExpense] = useState(false);
    const [newExpenseForm, setNewExpenseForm] = useState({
        fecha: format(new Date(), 'yyyy-MM-dd'),
        concepto: 'Comida',
        monto: '',
        forma_pago: 'Efectivo'
    });

    const [editRetentionState, setEditRetentionState] = useState({ monthId: null, value: '' });
    const [historicalData, setHistoricalData] = useState([]);

    const formatCurrency = (val) => {
        return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const loadHistoricalData = async (monthsList) => {
        try {
            const promises = monthsList.map(m => api.get(`/months/${m.id}/summary/`));
            const results = await Promise.all(promises);
            const data = monthsList.map((m, idx) => ({
                ...m,
                summary: results[idx].data
            }));
            data.sort((a, b) => new Date(b.anio, b.mes - 1) - new Date(a.anio, a.mes - 1));
            setHistoricalData(data);
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }
    };

    const loadBaseData = async () => {
        try {
            const res = await api.get('/months/');
            setMonths(res.data);
            if (res.data.length === 0) {
                setShowNewMonthObj(true);
            } else {
                loadHistoricalData(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBaseData();
    }, [api]);

    // Sync Calendar with Database Months
    useEffect(() => {
        if (months.length === 0) return;
        const foundMonth = months.find(m => m.mes === activeDate.getMonth() + 1 && m.anio === activeDate.getFullYear());

        if (foundMonth && foundMonth.id !== activeMonthId) {
            setActiveMonthId(foundMonth.id);
        } else if (!foundMonth && activeMonthId) {
            setActiveMonthId(null);
            setSummary(null);
            setExpenses([]);
        }
    }, [activeDate, months]);

    // Load backend data for active month
    useEffect(() => {
        if (activeMonthId) {
            loadMonthData(activeMonthId);
        }
    }, [activeMonthId, api]);

    const loadMonthData = async (id) => {
        try {
            const [sumRes, expRes] = await Promise.all([
                api.get(`/months/${id}/summary/`),
                api.get(`/months/${id}/expenses/`)
            ]);
            setSummary(sumRes.data);
            setExpenses(expRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateMonth = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/months/', newMonthForm);
            setShowNewMonthObj(false);
            await loadBaseData();
            setActiveMonthId(res.data.id);
            setCurrentView('resumen');

            // Focus Calendar on this newly created month
            setActiveDate(new Date(res.data.anio, res.data.mes - 1, 1));
            setNewMonthForm({ anio: new Date().getFullYear(), mes: new Date().getMonth() + 1, ingreso_mensual: '', retencion: '' });
        } catch (err) {
            alert(err.response?.data?.detail || 'Error al crear el mes');
        }
    };

    const handleCreateExpense = async (e) => {
        e.preventDefault();
        if (!activeMonthId) return alert("Crea primero un presupuesto para este mes.");
        try {
            const targetedDate = format(activeDate, 'yyyy-MM-dd');
            await api.post(`/months/${activeMonthId}/expenses/`, { ...newExpenseForm, fecha: targetedDate });
            setShowNewExpense(false);
            setNewExpenseForm({ ...newExpenseForm, monto: '', fecha: targetedDate });
            loadMonthData(activeMonthId);
            loadBaseData();
        } catch (err) {
            alert(err.response?.data?.detail || 'Error al crear gasto');
        }
    };

    const handleDeleteExpense = async (expId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este gasto?")) return;
        try {
            await api.delete(`/months/${activeMonthId}/expenses/${expId}`);
            loadMonthData(activeMonthId);
            loadBaseData();
        } catch (err) {
            alert('Error al eliminar el gasto');
        }
    };

    const handleDeleteMonth = async (e, monthId) => {
        e.stopPropagation();
        if (!window.confirm("¿Seguro que deseas eliminar este presupuesto base y TODO su historial de gastos?")) return;
        try {
            await api.delete(`/months/${monthId}`);
            if (activeMonthId === monthId) {
                setActiveMonthId(null);
                setSummary(null);
                setExpenses([]);
            }
            loadBaseData();
        } catch (err) {
            alert('Error al eliminar el mes');
        }
    };

    const handleClearRetention = async (monthId) => {
        if (!window.confirm("¿Seguro que deseas anular el ahorro retenido de este mes? El dinero regresará al saldo disponible.")) return;
        try {
            await api.patch(`/months/${monthId}`, { retencion: 0 });
            if (activeMonthId === monthId) loadMonthData(activeMonthId);
            loadBaseData();
            setEditRetentionState({ monthId: null, value: '' });
        } catch (err) {
            alert('Error al anular la retención');
        }
    };

    const handleUpdateRetention = async (e, monthId) => {
        e.preventDefault();
        try {
            await api.patch(`/months/${monthId}`, { retencion: Number(editRetentionState.value) });
            if (activeMonthId === monthId) loadMonthData(activeMonthId);
            loadBaseData();
            setEditRetentionState({ monthId: null, value: '' });
        } catch (err) {
            alert('Error al actualizar la retención');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderNav = (isMobile = false) => {
        const items = [
            { id: 'resumen', icon: Home, label: 'Inicio' },
            { id: 'meses', icon: CalendarIcon, label: 'Meses' },
            { id: 'ahorro', icon: Wallet, label: 'Ahorro' },
            { id: 'balance', icon: FileText, label: 'Balance' }
        ];

        if (isMobile) {
            return (
                <nav className="bottom-nav">
                    {items.map(it => (
                        <button key={it.id} className={`nav-item ${currentView === it.id ? 'active' : ''}`} onClick={() => setCurrentView(it.id)}>
                            <it.icon size={22} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{it.label}</span>
                        </button>
                    ))}
                </nav>
            );
        }

        return (
            <nav className="flex flex-col" style={{ gap: '0.5rem', flex: 1 }}>
                {items.map(it => (
                    <button key={it.id} className={`nav-item flex items-center gap-1 ${currentView === it.id ? 'active' : ''}`}
                        style={{ flexDirection: 'row', padding: '0.75rem 1rem', width: '100%', justifyContent: 'flex-start' }}
                        onClick={() => setCurrentView(it.id)}
                    >
                        <it.icon size={20} /> <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: '0.5rem' }}>{it.label}</span>
                    </button>
                ))}
            </nav>
        );
    };

    const renderSelectedDayHeader = () => (
        <div className="flex flex-col items-center justify-center mb-6" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '4.5rem', lineHeight: 1, fontWeight: 700, margin: 0, color: 'var(--color-peach)' }}>
                {format(activeDate, 'd')}
            </h1>
            <h2 className="text-2xl capitalize mt-1" style={{ color: 'var(--color-pearl)' }}>
                {format(activeDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <p className="capitalize mt-1" style={{ color: 'var(--color-purple)', fontWeight: 600 }}>
                {format(activeDate, 'EEEE', { locale: es })}
            </p>
        </div>
    );

    const renderCalendar = () => {
        const monthStart = startOfMonth(activeDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const dateFormat = "d";
        let days = [];
        let day = startDate;

        const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const formattedDate = format(day, dateFormat);
                const cloneDay = day;

                const dayStr = format(cloneDay, 'yyyy-MM-dd');
                const dayExpenses = expenses.filter(e => e.fecha === dayStr);
                const hasExpenses = dayExpenses.length > 0;

                days.push(
                    <div
                        key={day.toString()}
                        className={`calendar-day ${!isSameMonth(day, monthStart) ? 'disabled' : ''} ${isSameDay(day, activeDate) ? 'selected' : ''}`}
                        onClick={() => {
                            setActiveDate(cloneDay);
                            setNewExpenseForm({ ...newExpenseForm, fecha: format(cloneDay, 'yyyy-MM-dd') });
                        }}
                    >
                        <span>{formattedDate}</span>
                        {hasExpenses && <div className="expense-dot" />}
                    </div>
                );
                day = addDays(day, 1);
            }
        }

        return (
            <div className="calendar-container w-full mb-6">
                <div className="calendar-header">
                    <button className="btn-secondary flex items-center justify-center" style={{ padding: '0.5rem', borderRadius: '8px' }} onClick={() => setActiveDate(subMonths(activeDate, 1))}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-xl capitalize">{format(activeDate, 'MMMM yyyy', { locale: es })}</h2>
                    <button className="btn-secondary flex items-center justify-center" style={{ padding: '0.5rem', borderRadius: '8px' }} onClick={() => setActiveDate(addMonths(activeDate, 1))}>
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div className="calendar-grid">
                    {weekDays.map(wd => <div key={wd} className="calendar-day-name">{wd}</div>)}
                    {days}
                </div>
            </div>
        );
    };

    if (loading) return <div className="app-layout flex items-center justify-center text-pearl">Cargando datos...</div>;

    const activeDayExpenses = expenses.filter(e => e.fecha === format(activeDate, 'yyyy-MM-dd'));
    const displayedExpenses = listScope === 'mes' ? expenses : activeDayExpenses;

    return (
        <div className="app-layout">
            {/* SIDEBAR DESKTOP */}
            <aside className="sidebar">
                <div className="flex items-center gap-1 mb-6" style={{ marginBottom: '3rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--color-purple), #8a6ef5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wallet size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, marginLeft: '0.5rem' }}>VaneFi</span>
                </div>

                {renderNav()}

                <button onClick={handleLogout} className="btn-secondary flex items-center gap-1" style={{ padding: '0.75rem', borderRadius: '12px', justifyContent: 'center' }}>
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="main-content fade-in-up">
                <div className="flex items-center" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="text-2xl flex items-center gap-1">
                            {currentView === 'resumen' && 'Mi Calendario'}
                            {currentView === 'meses' && 'Gestión de Meses'}
                            {currentView === 'ahorro' && 'Ahorro Retenido'}
                            {currentView === 'balance' && 'Balance Histórico'}

                            {currentView === 'resumen' && summary?.alerta && (
                                <div className="flex items-center gap-1" style={{ marginLeft: '1rem', padding: '4px 8px', borderRadius: '12px', backgroundColor: 'rgba(234, 76, 137, 0.1)', color: 'var(--color-danger)', fontSize: '0.75rem' }}>
                                    <AlertTriangle size={14} /> ¡Alerta de Gasto!
                                </div>
                            )}
                        </h1>
                        <p className="text-pearl text-sm mt-1">
                            {currentView === 'resumen' && 'Organiza y visualiza tus movimientos del día a día.'}
                            {currentView === 'meses' && 'Crea y administra tus presupuestos base.'}
                            {currentView === 'ahorro' && 'La sumatoria de todas tus retenciones intocables.'}
                            {currentView === 'balance' && 'Mira de un vistazo lo que sobró cada mes.'}
                        </p>
                    </div>

                    <div style={{ display: window.innerWidth > 768 ? 'none' : 'block' }}>
                        <button onClick={handleLogout} className="text-pearl"><LogOut size={24} /></button>
                    </div>
                </div>

                {/* --- VIEW: RESUMEN (Default/Calendar) --- */}
                {currentView === 'resumen' && (
                    <div className="fade-in-up delay-1" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {renderSelectedDayHeader()}
                        {renderCalendar()}

                        {!activeMonthId ? (
                            <div className="card text-center flex flex-col items-center justify-center" style={{ padding: '3rem 2rem' }}>
                                <CalendarIcon size={40} className="text-pearl mb-4" />
                                <h3 className="text-xl mb-2 text-pearl">Mes sin presupuesto</h3>
                                <p className="text-pearl mb-4">No has asignado un ingreso base para este mes.</p>
                                <button className="btn" onClick={() => {
                                    setNewMonthForm({ ...newMonthForm, mes: activeDate.getMonth() + 1, anio: activeDate.getFullYear() });
                                    setCurrentView('meses');
                                    setShowNewMonthObj(true);
                                }}>Configurar Presupuesto</button>
                            </div>
                        ) : (
                            <>
                                {summary && (
                                    <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--color-martinique-light), var(--color-martinique))', padding: '1rem 1.5rem' }}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-pearl">Balance Disponible Mes</span>
                                                <span className="text-2xl font-bold">{formatCurrency(summary.ahorro)}</span>
                                            </div>
                                            <div className="flex flex-col" style={{ textAlign: 'right' }}>
                                                <span className="text-sm text-pearl">% de Ingreso</span>
                                                <span className={`text-lg font-bold ${summary.alerta ? 'text-danger' : 'text-purple'}`}>{summary.porcentaje_gastado}%</span>
                                            </div>
                                        </div>
                                        {Number(summary.retencion) > 0 && (
                                            <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '1rem', paddingTop: '1rem' }}>
                                                <span className="text-sm text-pearl flex items-center gap-2">
                                                    <Wallet size={16} className="text-success" />
                                                    Retenido este mes: <strong className="text-success">{formatCurrency(summary.retencion)}</strong>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {summary && Number(summary.pronosticado) > 0 && (
                                    <div className="card mb-6 flex items-center gap-4" style={{ padding: '1rem 1.5rem', borderLeft: '4px solid var(--color-success)' }}>
                                        <div style={{ backgroundColor: 'rgba(46, 213, 115, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                                            <TrendingUp size={24} className="text-success" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg">Pronóstico: {formatCurrency(summary.pronosticado)}</span>
                                            <span className="text-sm text-pearl" style={{ lineHeight: 1.4 }}>Según tu historial de meses anteriores, estimamos que este será tu nivel de gasto actual.</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex gap-4 items-center flex-wrap">
                                        <h3 className="text-xl">Movimientos</h3>
                                        <div style={{ display: 'flex', backgroundColor: 'rgba(1, 1, 1, 0.4)', borderRadius: '20px', padding: '4px' }}>
                                            <button
                                                onClick={() => setListScope('dia')}
                                                style={{ border: 'none', cursor: 'pointer', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', backgroundColor: listScope === 'dia' ? 'var(--color-purple)' : 'transparent', color: listScope === 'dia' ? 'white' : 'var(--color-pearl)' }}>
                                                Día {format(activeDate, 'd')}
                                            </button>
                                            <button
                                                onClick={() => setListScope('mes')}
                                                style={{ border: 'none', cursor: 'pointer', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', backgroundColor: listScope === 'mes' ? 'var(--color-purple)' : 'transparent', color: listScope === 'mes' ? 'white' : 'var(--color-pearl)' }}>
                                                Mes Entero
                                            </button>
                                        </div>
                                    </div>
                                    <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => setShowNewExpense(!showNewExpense)}>
                                        <Plus size={16} /> Añadir
                                    </button>
                                </div>

                                {showNewExpense && (
                                    <div className="card mb-6" style={{ background: 'rgba(58, 49, 83, 0.4)' }}>
                                        <form onSubmit={handleCreateExpense} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Categoría</label>
                                                <select className="input-field" value={newExpenseForm.concepto} onChange={e => setNewExpenseForm({ ...newExpenseForm, concepto: e.target.value })}>
                                                    <option value="Comida">Comida</option>
                                                    <option value="Gasolina">Gasolina</option>
                                                    <option value="Deuda">Deuda</option>
                                                    <option value="Pago servicio">Pago servicio</option>
                                                    <option value="Otro">Otro</option>
                                                </select>
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Monto</label>
                                                <input type="number" step="0.01" className="input-field" required value={newExpenseForm.monto} onChange={e => setNewExpenseForm({ ...newExpenseForm, monto: e.target.value })} />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Forma Pago</label>
                                                <select className="input-field" value={newExpenseForm.forma_pago} onChange={e => setNewExpenseForm({ ...newExpenseForm, forma_pago: e.target.value })}>
                                                    <option value="Efectivo">Efectivo</option>
                                                    <option value="Digital">Digital</option>
                                                </select>
                                            </div>
                                            <button type="submit" className="btn" style={{ height: '50px' }}>Guardar</button>
                                        </form>
                                    </div>
                                )}

                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    {displayedExpenses.length === 0 ? (
                                        <p className="text-pearl" style={{ padding: '2rem', textAlign: 'center' }}>Limpieza total. No hay gastos {listScope === 'dia' ? 'este día' : 'en todo este mes'}.</p>
                                    ) : (
                                        <div className="flex flex-col" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {displayedExpenses.map((exp, idx) => (
                                                <div key={exp.id} className="flex justify-between items-center" style={{ padding: '1rem 1.5rem', borderBottom: idx !== displayedExpenses.length - 1 ? '1px solid rgba(177, 174, 187, 0.1)' : 'none' }}>
                                                    <div className="flex flex-col gap-1">
                                                        <span style={{ fontWeight: 500 }}>{exp.concepto} <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', opacity: 0.6, fontWeight: 400 }}>{exp.fecha}</span></span>
                                                        <span className="text-pearl text-sm">{exp.forma_pago}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1" style={{ gap: '1rem' }}>
                                                        <span className="text-danger font-bold">-{formatCurrency(exp.monto)}</span>
                                                        <button onClick={() => handleDeleteExpense(exp.id)} className="text-pearl hover:text-danger" style={{ transition: 'color 0.2s', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* --- VIEW: MESES --- */}
                {currentView === 'meses' && (
                    <div className="fade-in-up delay-1">
                        <button className="btn mb-6" onClick={() => setShowNewMonthObj(!showNewMonthObj)}>
                            <Plus size={18} /> Crear mes base
                        </button>

                        {showNewMonthObj && (
                            <div className="card mb-6" style={{ maxWidth: '500px' }}>
                                <h2 className="text-lg mb-4">Ingresar Presupuesto</h2>
                                <form onSubmit={handleCreateMonth}>
                                    <div className="flex" style={{ gap: '1rem' }}>
                                        <div className="input-group" style={{ flex: 1 }}>
                                            <label>Mes</label>
                                            <select className="input-field" required value={newMonthForm.mes} onChange={e => setNewMonthForm({ ...newMonthForm, mes: Number(e.target.value) })}>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                    <option key={m} value={m} style={{ textTransform: 'capitalize' }}>{format(new Date(2024, m - 1, 1), 'MMMM', { locale: es })}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="input-group" style={{ flex: 1 }}>
                                            <label>Año</label>
                                            <input type="number" min="2000" className="input-field" required value={newMonthForm.anio} onChange={e => setNewMonthForm({ ...newMonthForm, anio: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Ingreso Fijo ($)</label>
                                        <input type="number" step="0.01" className="input-field" required value={newMonthForm.ingreso_mensual} onChange={e => setNewMonthForm({ ...newMonthForm, ingreso_mensual: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Retención Intocable ($) - Opcional</label>
                                        <input type="number" step="0.01" className="input-field" value={newMonthForm.retencion} onChange={e => setNewMonthForm({ ...newMonthForm, retencion: e.target.value })} placeholder="0.00" />
                                    </div>
                                    <button className="btn" type="submit">Guardar Base</button>
                                </form>
                            </div>
                        )}

                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {months.map(m => (
                                <div key={m.id} className="card flex items-center justify-between"
                                    style={{ cursor: 'pointer', border: activeMonthId === m.id ? '2px solid var(--color-purple)' : '1px solid rgba(177, 174, 187, 0.05)' }}
                                    onClick={() => {
                                        setActiveMonthId(m.id);
                                        setActiveDate(new Date(m.anio, m.mes - 1, 1));
                                        setCurrentView('resumen');
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold capitalize">{format(new Date(m.anio, m.mes - 1, 1), 'MMMM yyyy', { locale: es })}</span>
                                        <span className="text-pearl text-sm mt-1">Ingreso: {formatCurrency(m.ingreso_mensual)}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={(e) => handleDeleteMonth(e, m.id)} className="text-pearl hover:text-danger" style={{ transition: 'color 0.2s', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                        <ChevronRight className="text-pearl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- VIEW: AHORRO --- */}
                {currentView === 'ahorro' && (
                    <div className="fade-in-up delay-1" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="card flex items-center flex-col justify-center" style={{ textAlign: 'center', padding: '3rem 2rem', marginBottom: '2rem' }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(46, 213, 115, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <Wallet size={40} className="text-success" />
                            </div>
                            <p className="text-pearl text-lg mb-2">Total Retenido (Histórico)</p>
                            <h2 className="text-5xl font-bold text-success mb-6">
                                {formatCurrency(months.reduce((acc, current) => acc + Number(current.retencion), 0))}
                            </h2>
                            <p className="text-pearl text-sm max-w-md mx-auto">Este dinero proviene de la métrica de reserva pasiva que defines de tu ingreso base.</p>
                        </div>

                        <h3 className="text-xl mb-4">Retenciones por mes</h3>
                        <div className="flex flex-col gap-4">
                            {historicalData.map(m => (
                                <div key={m.id} className="card" style={{ padding: '1rem 1.5rem' }}>
                                    <div className="flex justify-between items-center flex-wrap gap-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold capitalize">{format(new Date(m.anio, m.mes - 1, 1), 'MMMM yyyy', { locale: es })}</span>
                                            {editRetentionState.monthId !== m.id && (
                                                <span className="text-success">Retención: {formatCurrency(m.retencion)}</span>
                                            )}
                                        </div>
                                        {editRetentionState.monthId === m.id ? (
                                            <form onSubmit={(e) => handleUpdateRetention(e, m.id)} className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="input-field"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', height: 'auto', width: '120px' }}
                                                    placeholder="Monto"
                                                    required
                                                    value={editRetentionState.value}
                                                    onChange={e => setEditRetentionState({ ...editRetentionState, value: e.target.value })}
                                                />
                                                <button type="submit" className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>Guardar</button>
                                                <button type="button" onClick={() => setEditRetentionState({ monthId: null, value: '' })} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>Cancelar</button>
                                            </form>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setEditRetentionState({ monthId: m.id, value: m.retencion })} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Editar</button>
                                                {Number(m.retencion) > 0 && <button onClick={() => handleClearRetention(m.id)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: 'rgba(234, 76, 137, 0.1)', color: 'var(--color-danger)' }}>Anular</button>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- VIEW: BALANCE --- */}
                {currentView === 'balance' && (
                    <div className="fade-in-up delay-1" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="card flex items-center flex-col justify-center" style={{ textAlign: 'center', padding: '3rem 2rem', marginBottom: '2rem' }}>
                            <FileText size={40} className="text-purple mb-4" />
                            <p className="text-pearl">Historial de Sobrantes Consensuados.</p>
                            <h2 className="text-5xl font-bold mt-4">
                                {formatCurrency(historicalData.reduce((acc, current) => acc + Number(current.summary.ahorro), 0))}
                            </h2>
                            <p className="text-pearl text-sm max-w-md mx-auto mt-2">Corresponde al total del dinero libre restante tras restar gastos a tus ahorros a lo largo de los meses.</p>
                        </div>

                        <h3 className="text-xl mb-4">Balance por mes</h3>
                        <div className="flex flex-col gap-4">
                            {historicalData.map(m => (
                                <div key={m.id} className="card flex justify-between items-center flex-wrap gap-4" style={{ padding: '1rem 1.5rem', borderLeft: m.summary.ahorro < 0 ? '4px solid var(--color-danger)' : '4px solid var(--color-purple)' }}>
                                    <div className="flex flex-col">
                                        <span className="font-bold capitalize">{format(new Date(m.anio, m.mes - 1, 1), 'MMMM yyyy', { locale: es })}</span>
                                        <span className="text-pearl text-sm">Ingreso: {formatCurrency(m.ingreso_mensual)} | Gastos: {formatCurrency(m.summary.gastos_totales)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xl font-bold ${m.summary.ahorro < 0 ? 'text-danger' : 'text-purple'}`}>{formatCurrency(m.summary.ahorro)}</span>
                                        <p className="text-sm text-pearl" style={{ opacity: 0.8 }}>Sobrante</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {renderNav(true)}
        </div>
    );
}
