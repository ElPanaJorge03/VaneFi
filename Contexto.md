ARCHIVO DE CONOCIMIENTO DEL PROYECTO
FinanceApp — Gestión Financiera Personal
1. Descripción del Proyecto
Aplicación web de gestión financiera personal con soporte para múltiples usuarios. Permite registrar ingresos y gastos diarios, monitorear el ahorro mensual, y visualizar el balance histórico. Incluye alertas automáticas cuando los gastos superan el 80% del ingreso mensual y un módulo de pronóstico basado en historial.

Cliente: proyecto pagado para un tercero. Tiempo de entrega: 6 meses. Alcance cerrado.

2. Stack Tecnológico
Capa	Tecnología	Nota
Frontend	React	Ya dominado por el desarrollador
Backend	Python + FastAPI	Ya dominado — se prefiere sobre Django por pragmatismo
Base de datos	PostgreSQL	Ya dominado
Despliegue	Railway	Sin Docker local por limitaciones de hardware
Autenticación	JWT	Múltiples usuarios por instancia

3. Usuarios del Sistema
Múltiples usuarios por instancia. Cada usuario tiene sus propios datos completamente aislados de los demás. No hay roles de administrador, todos los usuarios son iguales.

4. Pantallas y Funcionalidad
Pantalla 1 — Inicio de Sesión
•	Usuario y contraseña.
•	Opción de recordar contraseña.
•	Opción de crear cuenta.
•	Logo de la app.

Pantalla 2 — Página Principal (Vista Mensual)
•	Muestra el mes actual con flechas para navegar entre meses.
•	Días del mes numerados y seleccionables.
•	Alerta visible cuando los gastos superan el 80% del ingreso mensual.
•	Muestra: nombre del usuario, ahorro del mes, balance del mes.
•	Fecha y hora actual en grande.

Pantalla 3 — Mes Escogido (Detalle del Mes)
•	Vista de calendario del mes seleccionado.
•	Al tocar un día, muestra la información de ese día.
•	Muestra: gasto del mes acumulado y total del mes.

Pantalla 4 — Alertas
•	Se activa cuando los gastos superan el 80% del ingreso mensual.
•	Muestra: total de ingresos, total de gastos, ahorro, pronosticado, otras ingresos.
•	Gráficos visuales del estado financiero del mes.
Pronosticado: gasto estimado calculado automáticamente por el sistema basado en el promedio de gastos de meses anteriores.

Pantalla 5 — Día
•	Muestra el día del mes con fecha.
•	Registro de gastos e ingresos del día.
•	Cada gasto tiene: concepto (categoría predefinida), monto, forma de pago (Efectivo o Digital).
•	Cada ingreso tiene: concepto (texto libre), monto.
•	Muestra total del día.
•	Botón para ingresar nuevo movimiento.

Categorías predefinidas de gastos: Comida, Gasolina, Deuda, Pago servicio, Otro.

Pantalla 6 — Ahorro
•	Ahorro por concepto.
•	Ahorro total del mes.
•	Gráficos o tabla de ahorro.
•	Ahorro porcentual e ingreso porcentual.
•	Retención: monto fijo que el usuario define manualmente y no puede tocar.

Pantalla 7 — Balance
•	Tabla histórica por mes con columnas: Mes, Total Ingreso, Total Gastos, Total Ahorro, Total (lo que sobró).
•	Notas por mes.
•	Filtrable por año.

5. Reglas de Negocio
Regla	Descripción
Ingreso mensual obligatorio	Al inicio de cada mes, el usuario debe ingresar su ingreso mensual antes de poder registrar gastos. La app obliga este paso.
Alerta de gastos	Se activa automáticamente cuando los gastos acumulados superan el 80% del ingreso mensual. No es configurable.
Pronosticado	El sistema calcula automáticamente el gasto estimado del mes basado en el promedio de gastos de meses anteriores.
Retención	Monto fijo que el usuario ingresa manualmente. Representa dinero reservado que no se toca.
Otras ingresos	Ingresos adicionales al ingreso mensual principal. El usuario escribe el concepto libremente.
Formas de pago	Efectivo o Digital (cualquier pago electrónico: transferencia, tarjeta, app de pagos).
Total del mes en Balance	Dinero que sobró después de restar gastos y retención al ingreso mensual.
Múltiples usuarios	Cada usuario tiene datos completamente aislados. No comparten información.

6. Modelo de Datos (Entidades Principales)
Entidad	Campos clave
Usuario	id, nombre, email, password_hash, creado_en
Mes	id, usuario_id, año, mes, ingreso_mensual, retencion, creado_en
Gasto	id, mes_id, fecha, concepto (categoría), monto, forma_pago (efectivo/digital)
Ingreso adicional	id, mes_id, fecha, concepto (texto libre), monto
Balance	Calculado — no almacenado. Se deriva de Mes, Gastos e Ingresos adicionales.
Pronosticado	Calculado — promedio de gastos de meses anteriores del mismo usuario.

7. Contexto del Desarrollador
•	Proyecto pagado para un cliente. Tiempo de entrega: 6 meses. Alcance cerrado.
•	Desarrollador individual.
•	React, FastAPI y PostgreSQL ya dominados.
•	Sin Docker en local por limitaciones de hardware. Railway gestiona el despliegue.
•	Alcance cerrado: no se agregan funcionalidades fuera de las definidas en este documento sin acuerdo explícito con el cliente.
