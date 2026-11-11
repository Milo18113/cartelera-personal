# PRD — Mi Cartelera Personal

- **Versión:** 1.0 (para el Checkpoint 2)
- **Fecha:** 2026-11-10
- **Autor:** Emilio Puga
- **Estado:** E1 construida · E2 especificada, sin implementar

Este documento dice **qué** se construye y **para quién**. No dice cómo: la solución técnica vive en `docs/specs/`.

## 1. Resumen

Mi Cartelera Personal es una aplicación web donde cada persona lleva su propia lista de películas y series: lo que quiere ver, lo que está viendo y lo que ya vio, con su calificación y sus comentarios.

El producto se organiza en dos épicas:

- **E1 — Mi Cartelera Personal.** Ya está construida (Proyecto 3). Es la lista personal.
- **E2 — Noche de película.** Es lo nuevo. Cuando la persona tiene un rato libre, le dice a la app cuánto tiempo tiene y la app le muestra qué películas de su lista caben. Con ellas arma una sesión y la guarda para esa noche.

## 2. Problema

La persona tiene muchas películas «por ver», pero cuando le queda un rato libre no sabe cuáles caben en ese tiempo. Empieza algo que no alcanza a terminar y la noche se pierde.

Hoy la aplicación sabe qué quiere ver la persona, pero no sabe **cuánto dura** cada cosa ni cuánto tiempo hay disponible. Esa distancia es la que cierra E2.

## 3. Usuarios

Un solo tipo de usuario: **la misma persona que ya usa Mi Cartelera**, con su cuenta y su lista. Ve películas por gusto, en ratos sueltos, y quiere decidir rápido sin hacer cuentas de cabeza. No comparte su lista ni sus sesiones con nadie.

## 4. Épicas

### E1 — Mi Cartelera Personal (construida)

Lo que la persona puede hacer hoy:

- Crear una cuenta, entrar y salir. Cada persona ve únicamente lo suyo.
- Buscar películas y series y ver su ficha: póster, sinopsis, director o creador, géneros, reparto y nota general.
- Guardar un título en su lista con un estado: **por ver**, **viendo** o **vista**.
- Poner su propia calificación (1 a 5) y un comentario libre.
- Ver un resumen por estado, filtrar y ordenar su lista, y recibir recomendaciones.

Reglas de E1 de las que depende E2:

- Un título aparece una sola vez en la lista de una persona.
- Cada título tiene exactamente un estado.
- E2 **no cambia** ninguna de estas funciones: al terminar el proyecto siguen funcionando igual.

La deuda conocida de E1 (mejoras de interfaz y pendientes técnicos) está registrada en `docs/ESTADO-INICIAL.md` y no forma parte de E2.

### E2 — Noche de película

**Objetivo.** Que la persona sepa, en segundos, qué películas de su lista caben en el tiempo que tiene, y pueda guardar la combinación que elija.

**Éxito.** El usuario termina lo que empieza. Se comprueba así: toda sesión guardada cabe en el tiempo con el que se armó, siempre, y la app nunca ofrece agregar una película que ya no cabe.

**Recorrido de la persona:**

1. Entra a «Noche de película».
2. Indica cuánto tiempo tiene.
3. Ve qué películas de su lista caben, cada una con su duración. Las que no tienen duración conocida aparecen como no disponibles, con el motivo.
4. Agrega y quita películas. En todo momento ve la duración total (con las pausas) y el tiempo que le queda.
5. Si intenta agregar una que no cabe en lo que queda, la app no la agrega y le explica por qué.
6. Guarda la sesión, con un nombre si quiere.
7. Más tarde consulta sus sesiones guardadas y el detalle de cada una.

## 5. Alcance de E2

Dentro:

- Una pantalla «Noche de película», accesible solo con sesión iniciada.
- Indicar y validar el tiempo disponible.
- Ver qué películas por ver caben, con su duración, y cuáles no están disponibles y por qué.
- Armar una sesión con una o varias películas, con duración total y tiempo restante visibles.
- Guardar la sesión y consultar las sesiones guardadas y su detalle.
- Que ninguna persona pueda ver ni modificar las sesiones de otra.

## 6. No-alcance

Fuera de E2, de forma definitiva para esta versión:

- Series.
- Ver con amigos o compartir sesiones.
- Recordatorios y notificaciones.
- Sincronizar con plataformas de streaming o con calendarios.
- Recomendar películas que no están en la lista de la persona.
- Programar una sesión para una fecha y hora (se acerca a recordatorios y calendarios).
- Modificar o eliminar una sesión ya guardada (ver DEC-03).
- Marcar una sesión como realizada: contradice la regla RN-09.

Los puntos extra del brief (llenar mi noche, filtro por género, validación adicional en la base de datos, revisión adversarial, publicación) quedan fuera de esta versión. Si alguno entra, lo hace con su propia historia, sus criterios y su lugar en la spec **antes** del código.

## 7. Reglas de negocio

RN-02 a RN-06 y RN-09 son decisiones ya tomadas por el cliente. RN-01, RN-07, RN-08 y RN-10 se derivan de la ficha del cliente y de las decisiones de la sección 8.

- **RN-01 · Acceso.** «Noche de película» solo está disponible con sesión iniciada. Cada persona ve únicamente sus propias sesiones.
- **RN-02 · Tiempo disponible.** Es un número entero de minutos, entre 30 y 600, ambos incluidos. Cualquier otro valor se rechaza y la app explica el motivo.
- **RN-03 · Qué entra en una sesión.** Solo películas de la lista de la persona que estén en estado «por ver». Las series no entran.
- **RN-04 · Duración.** Se toma de TMDB. Una película sin duración conocida no se puede agregar y la app explica por qué.
- **RN-05 · Pausas.** Hay 10 minutos de pausa entre una película y la siguiente. No hay pausa antes de la primera ni después de la última.
- **RN-06 · Límite exacto.** Una sesión que ocupa exactamente el tiempo disponible **sí** cabe.
- **RN-07 · Duración total.** Es la suma de las duraciones de las películas más las pausas. Es decir, la suma de duraciones más 10 minutos por cada película después de la primera.
- **RN-08 · Qué cabe.** Una sesión cabe si su duración total no supera el tiempo disponible. El tiempo restante es el tiempo disponible menos la duración total. Si una película no cabe en lo que queda, no se agrega.
- **RN-09 · Estado de los títulos.** Guardar una sesión no cambia el estado de sus películas: siguen «por ver».
- **RN-10 · Sesión guardada.** Conserva los datos de sus películas tal como estaban al armarla y es de solo lectura (DEC-03 y DEC-04).

Ejemplos de la regla:

- Una sola película de 100 minutos con 100 disponibles: cabe. No hay pausa.
- Tres películas de 90, 100 y 120 minutos: duran 310 minutos más 20 de pausas, es decir 330. Con 330 disponibles caben justo; con 329 no caben.
- Con 200 minutos disponibles y una película de 100 ya agregada, otra de 95 no cabe: 100 + 10 + 95 = 205.

## 8. Decisiones sobre los puntos abiertos del cliente

Cada una queda resuelta aquí y se refleja en los criterios del backlog.

- **DEC-01 · ¿Una película puede estar en dos sesiones guardadas?** **Sí.** Cada sesión es un plan para una noche distinta, y guardar una sesión no cambia el estado de la película (RN-09), así que no hay motivo para bloquearla. La app no advierte de la repetición.
- **DEC-02 · ¿En qué orden se muestran las películas que caben?** **La que lleva más tiempo en la lista va primero**, y si dos empatan, por título alfabético. Así el orden es siempre el mismo y ayuda a vaciar la lista de pendientes.
- **DEC-03 · ¿Se puede modificar una sesión después de guardarla?** **No.** Una sesión guardada se consulta, no se modifica ni se elimina. Si la persona quiere un plan distinto, arma otra sesión. Editar obligaría a volver a comprobar que la sesión cabe y a proteger una operación más; con el plazo del entregable es lo más conveniente de recortar. `[SUPUESTO]`
- **DEC-04 · Si la persona quita de su lista una película que está en una sesión guardada, ¿qué pasa con la sesión?** **No cambia.** La sesión conserva el título, la duración y el póster de cada película tal como estaban al armarla. Una sesión es un plan histórico y no debe alterarse por algo que ocurre después.
- **DEC-05 · ¿Una sesión tiene nombre o fecha?** **Nombre opcional y fecha de creación automática.** Si la persona no escribe un nombre, la sesión se llama «Noche del 11 de nov», con la fecha en que se guardó. No hay fecha programada, porque eso es un recordatorio (no-alcance).

## 9. Supuestos

Cosas que damos por ciertas porque el cliente no las fijó. Si alguna resulta falsa, se revisa el criterio que la usa.

- **SUP-01.** Una sesión necesita al menos una película para poder guardarse.
- **SUP-02.** Una película aparece una sola vez dentro de una misma sesión.
- **SUP-03.** Las películas que se ofrecen son las que **caben solas** en el tiempo disponible. Una película más larga que el tiempo disponible no se ofrece; si ninguna cabe, la app lo dice.
- **SUP-04.** La sesión guarda también el tiempo disponible con el que se armó, para mostrar cuánto sobraba.
- **SUP-05.** Dentro de la sesión, las películas se muestran en el orden en que se agregaron.
- **SUP-06.** El nombre de la sesión mide hasta 60 caracteres y puede repetirse. La fecha del nombre por defecto es la del día en que se guarda, en hora local.
- **SUP-07.** No hay límite de sesiones guardadas ni de películas por sesión, aparte del tiempo disponible.
- **SUP-08.** Una duración de 0 minutos o ausente se trata como «sin duración conocida».
- **SUP-09.** Si la consulta de duración falla por un problema de conexión, la app lo distingue de «sin duración conocida» y permite reintentar.

## 10. Puntos abiertos

- **PA-01.** Casos borde que aparezcan en el refinamiento con la IA. Cada uno se acepta o se rechaza con su razón en `docs/backlog/refinamiento-e2.md`; los aceptados se reflejan en los criterios.
- **PA-02.** Redacción exacta de los mensajes de «por qué no cabe». Propuesta: indicar cuántos minutos faltan. Se define en la spec de interfaz.
- **PA-03.** Cuántas películas por ver se consultan a la vez cuando la lista es muy grande. Se define en la spec.
- **PA-04.** Si algún punto extra entra antes de la entrega, y cuál.

## 11. Glosario

- **Sesión:** conjunto ordenado de películas que la persona planea ver seguidas en una noche.
- **Tiempo disponible:** minutos que la persona tiene libres.
- **Pausa:** 10 minutos entre dos películas consecutivas de una sesión.
- **Duración total:** suma de las duraciones más las pausas.
- **Tiempo restante:** tiempo disponible menos duración total.
- **Por ver:** estado de una película que la persona aún no empieza.
