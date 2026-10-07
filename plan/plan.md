# Plan de Ejecución — Scenario Simulation Lab en NEXUS-DQPS

## Instrucciones de bucle (ralph)

Cada iteración ejecuta **una sola** acción y termina. No encadenes tareas.

1. **Localizar la siguiente subtarea**:
   - Recorre `plan.md` de arriba a abajo y encuentra el primer `[ ]`.
   - Si la línea enlaza a un fichero `task/NN.md`, abre el fichero y repite la búsqueda recursivamente dentro de él hasta llegar a una subtarea `[ ]` hoja (sin enlace).
   - Si no encuentras ningún `[ ]` en ninguna parte → **crea `plan/stop.md`** con una nota breve ("plan completo, sin subtareas pendientes") y **para**. El fichero `stop.md` es la señal que `ralph-loop.sh` usa para detenerse; sin él el bucle sigue iterando aunque no haya trabajo.
2. **Ejecutar esa única subtarea**:
   - Subtarea normal: realízala y márcala `[x]`.
   - Subtarea `[juez]`: invoca la skill `juez` sobre el repositorio pasándole las instrucciones del fichero `task/NN.md` correspondiente. La skill juzgará la evidencia y actualizará el fichero.
   - Si la subtarea consiste en **añadir** nuevas subtareas o crear un nuevo `task/NN.md`: añádelas y **no las ejecutes**; crear tareas cuenta como la acción única de la iteración.
   - **Excepción**: si al inspeccionar la subtarea descubres que el trabajo **ya está hecho** (el código/artefacto/condición existe sin necesidad de cambios), márcala `[x]` y **continúa con la siguiente subtarea en la misma iteración**. Marcar tareas ya completadas no cuenta como la acción única del bucle; solo el trabajo real (implementar, crear tareas, invocar a la juez) consume la iteración.
3. **Propagar hacia arriba**:
   - Tras marcar una subtarea, si **todas** las subtareas del `task/NN.md` están `[x]`, marca también la entrada correspondiente en `plan.md` como `[x]`.
4. **Parar**. No busques la siguiente subtarea, no encadenes iteraciones.

## Tareas

- [x] [Tarea 01: Modelo de datos y utilidades de cálculo determinista](plan/task/01.md)
- [x] [Tarea 02: Componente de visualización de flujo de capital (Phases 1 & 2)](plan/task/02.md)
- [x] [Tarea 03: Componentes de impacto, métricas Before/After y gráfico Recharts (Phases 3, 4, 5)](plan/task/03.md)
- [x] [Tarea 04: Recibo de Ejecución auditable y explicación "Why this reallocation" (Step 7 & 10)](plan/task/04.md)
- [x] [Tarea 05: Integración en ReallocationFeed, estado de tarjeta y prevención de doble ejecución](plan/task/05.md)
- [x] [Tarea 06: Integración en MissionControlConsole, Decision Ledger y Telemetría Financiera](plan/task/06.md)
- [x] [Tarea 07: Verificación final de compilación, tipos y funcionamiento end-to-end](plan/task/07.md)
- [x] [Tarea 08: Definición de tipos y Motor Matemático Determinista de Simulación](plan/task/08.md)
- [x] [Tarea 09: Enlace interactivo desde Landing Page Showcase con parámetros de escenario](plan/task/09.md)
- [x] [Tarea 10: Componentes de Entrada de Escenarios, Estrategias y Custom Strategy](plan/task/10.md)
- [x] [Tarea 11: Componentes de Resultados, Métricas Financieras, Causal Chain y Data Lineage](plan/task/11.md)
- [x] [Tarea 12: Gráficos de Simulación y Curva de Pérdida Acumulativa Recharts](plan/task/12.md)
- [x] [Tarea 13: Integración del Laboratorio de Simulación Completo en /dashboard/simulator](plan/task/13.md)
- [x] [Tarea 14: Verificación Final de Compilación, Chequeo de Tipos y Pruebas End-to-End](plan/task/14.md)
- [x] [Tarea 15: Mathematical Engine Upgrade & Fix Negative Profit Display](plan/task/15.md)
- [x] [Tarea 16: Compact Product Selector Component with Drawer](plan/task/16.md)
- [x] [Tarea 17: Minimal Campaign Configuration Panel & Live Budget Slider](plan/task/17.md)
- [x] [Tarea 18: Interactive Hill Response Curve Visualizer & 3 Key Metrics](plan/task/18.md)
- [x] [Tarea 19: Recommended Campaign, "Why This Campaign?" & Candidates Comparison](plan/task/19.md)
- [x] [Tarea 20: Master Console Assembly, Model Details Accordion & End-to-End Verification](plan/task/20.md)
