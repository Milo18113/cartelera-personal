# Historias de usuario — E2 Noche de película

Salen de las reglas del [PRD](../prd/PRD.md) (RN = regla de negocio, DEC = decisión, SUP = supuesto). Los criterios no llevan detalle técnico: dicen qué ve y qué logra la persona. Los casos borde que no estaban en el PRD se registran en [`refinamiento-e2.md`](refinamiento-e2.md) y vuelven aquí como criterios.

**INVEST.** Cada historia se revisa contra los seis criterios: Independiente, Negociable, Valiosa, Estimable, Pequeña y Testable. Donde una historia depende de otra se dice, porque ser independiente del todo no siempre es posible.

Orden de construcción: HU-01 → HU-02 → HU-03 → HU-04. HU-05 acompaña a todas.

---

## HU-01 — Ver qué películas caben en mi tiempo

> Como persona con un rato libre, quiero decir cuánto tiempo tengo y ver qué películas de mi lista caben, para no empezar algo que no alcanzo a terminar.

**Criterios de aceptación**

- **HU-01-C1.** DADO que estoy en «Noche de película», CUANDO indico un tiempo entero de 30 a 600 minutos (los extremos incluidos), ENTONCES la app lo acepta y me muestra las películas que caben.
- **HU-01-C2.** DADO que indico un tiempo menor que 30 o mayor que 600, CUANDO intento continuar, ENTONCES la app no lo acepta y me explica que debe estar entre 30 y 600 minutos.
- **HU-01-C3.** DADO que dejo el tiempo vacío o escribo algo que no es un número entero (por ejemplo, «90,5» o «una hora»), CUANDO intento continuar, ENTONCES la app no lo acepta y me explica que debe ser un número entero de minutos.
- **HU-01-C4.** DADO un tiempo válido, CUANDO veo las películas, ENTONCES solo aparecen películas de mi lista en estado «por ver», y ninguna serie.
- **HU-01-C5.** DADO un tiempo válido, CUANDO veo las películas, ENTONCES aparecen las que caben solas en ese tiempo, cada una con su duración. Una película cuya duración es exactamente mi tiempo sí aparece.
- **HU-01-C6.** DADO que tengo películas «por ver» sin duración conocida, CUANDO veo las películas, ENTONCES aparecen como no disponibles, con el motivo, y no puedo agregarlas.
- **HU-01-C7.** DADO varias películas que caben, CUANDO las veo, ENTONCES van de la que lleva más tiempo en mi lista a la más reciente y, si empatan, por título alfabético.
- **HU-01-C8.** DADO que la app está consultando las duraciones, CUANDO espero, ENTONCES veo que está cargando.
- **HU-01-C9.** DADO que la consulta de duraciones falla, CUANDO termina, ENTONCES veo un mensaje de error distinto de «sin duración» y puedo reintentar.
- **HU-01-C10.** DADO que no tengo películas «por ver», CUANDO abro la pantalla, ENTONCES un mensaje me lo dice.
- **HU-01-C11.** DADO que tengo películas «por ver» pero ninguna cabe en mi tiempo, CUANDO las veo, ENTONCES un mensaje me lo dice, distinto del anterior.
- **HU-01-C12.** DADO que cambio el tiempo disponible, CUANDO lo hago, ENTONCES la lista de películas que caben se actualiza.

**INVEST:** I — es la primera, no depende de otra. N — el orden y los mensajes son negociables. V — responde al problema central. E — alcance claro. S — cabe en un ticket de dominio y uno de pantalla. T — cada criterio se comprueba con datos concretos.

---

## HU-02 — Armar una sesión

> Como persona con un rato libre, quiero agregar y quitar películas de una sesión viendo siempre cuánto dura y cuánto me queda, para llenar mi noche sin pasarme.

**Criterios de aceptación**

- **HU-02-C1.** DADO una película que cabe, CUANDO la agrego, ENTONCES aparece en mi sesión y veo la duración total y el tiempo restante actualizados.
- **HU-02-C2.** DADO una sesión con una sola película, CUANDO veo la duración total, ENTONCES es la de esa película, sin pausa.
- **HU-02-C3.** DADO una sesión con varias películas, CUANDO veo la duración total, ENTONCES es la suma de las duraciones más 10 minutos por cada película después de la primera. Con películas de 90, 100 y 120 minutos son 330.
- **HU-02-C4.** DADO una película que no cabe en el tiempo que me queda, CUANDO intento agregarla, ENTONCES no se agrega y la app me explica por qué, diciendo cuántos minutos faltan.
- **HU-02-C5.** DADO una sesión que ocupa exactamente el tiempo disponible, CUANDO veo el tiempo restante, ENTONCES es 0 y la sesión es válida.
- **HU-02-C6.** DADO una película en mi sesión, CUANDO la quito, ENTONCES desaparece y la duración total y el tiempo restante se recalculan, incluidas las pausas.
- **HU-02-C7.** DADO una película que ya está en mi sesión, CUANDO intento agregarla otra vez, ENTONCES no se agrega de nuevo.
- **HU-02-C8.** DADO una sesión armada, CUANDO cambio el tiempo disponible a uno menor que su duración total, ENTONCES la app me indica cuánto me paso y no me deja guardarla hasta que quite películas.
- **HU-02-C9.** DADO una película sin duración conocida, CUANDO intento agregarla, ENTONCES no se agrega y la app me explica que no se conoce su duración.
- **HU-02-C10.** DADO una sesión vacía, CUANDO la veo, ENTONCES la duración total es 0 y el tiempo restante es todo mi tiempo disponible.

**INVEST:** I — parcial: necesita las películas que muestra HU-01; se prueba aparte porque la regla de «cabe» es independiente de la pantalla. N — la forma de mostrar los totales es negociable, las cuentas no. V — es donde la persona decide su noche. E — las cuentas están en el PRD con ejemplos. S — un ticket de pantalla sobre la regla ya probada. T — los ejemplos numéricos son verificables.

---

## HU-03 — Guardar mi sesión

> Como persona que armó una sesión, quiero guardarla con un nombre, para volver a ella la noche que la quiero ver.

**Criterios de aceptación**

- **HU-03-C1.** DADO una sesión con al menos una película que cabe, CUANDO la guardo, ENTONCES queda guardada y la app me lo confirma.
- **HU-03-C2.** DADO una sesión sin películas, CUANDO intento guardarla, ENTONCES no se guarda y la app me explica que agregue al menos una película.
- **HU-03-C3.** DADO que escribo un nombre de hasta 60 caracteres, CUANDO guardo, ENTONCES la sesión queda con ese nombre, tal como lo escribí.
- **HU-03-C4.** DADO que escribo un nombre de más de 60 caracteres, CUANDO intento guardar, ENTONCES la app me explica que el límite es 60 y no guarda hasta que lo corrija.
- **HU-03-C5.** DADO que dejo el nombre vacío o solo con espacios, CUANDO guardo, ENTONCES la sesión se llama «Noche del 11 de nov», con la fecha de hoy y el mes abreviado.
- **HU-03-C6.** DADO una sesión guardada, CUANDO reviso mi lista, ENTONCES sus películas siguen en «por ver».
- **HU-03-C7.** DADO una sesión guardada, CUANDO armo otra, ENTONCES puedo incluir una película que ya está en la primera.
- **HU-03-C8.** DADO una sesión guardada, CUANDO la consulto, ENTONCES recuerda el tiempo disponible con el que la armé.
- **HU-03-C9.** DADO que el guardado falla (por ejemplo, sin conexión), CUANDO termina el intento, ENTONCES la app me muestra un error y mi sesión armada sigue ahí para reintentar.
- **HU-03-C10.** DADO que pulso «Guardar» dos veces seguidas, CUANDO termina, ENTONCES se guarda una sola sesión.
- **HU-03-C11.** DADO un nombre con símbolos, emojis o caracteres de marcado, CUANDO se muestra después, ENTONCES se ve exactamente como lo escribí.

**INVEST:** I — parcial: guarda lo que arma HU-02. N — el texto del nombre por defecto es negociable. V — sin guardar, la sesión se pierde. E — claro. S — un ticket de servicio y uno de pantalla. T — cada criterio es comprobable.

---

## HU-04 — Consultar mis sesiones guardadas

> Como persona con sesiones guardadas, quiero ver la lista de mis sesiones y el detalle de cada una, para saber qué voy a ver esa noche.

**Criterios de aceptación**

- **HU-04-C1.** DADO que tengo sesiones guardadas, CUANDO abro mis sesiones, ENTONCES las veo de la más reciente a la más antigua, cada una con su nombre, su fecha y su duración total.
- **HU-04-C2.** DADO que no tengo sesiones guardadas, CUANDO abro mis sesiones, ENTONCES un mensaje me lo dice.
- **HU-04-C3.** DADO una sesión guardada, CUANDO abro su detalle, ENTONCES veo sus películas en el orden en que las agregué, la duración de cada una, la duración total, el tiempo disponible con el que la armé y cuánto sobraba.
- **HU-04-C4.** DADO una sesión que incluye una película que después quité de mi lista, CUANDO abro su detalle, ENTONCES la sesión se ve igual que cuando la guardé, con el título, la duración y el póster de esa película.
- **HU-04-C5.** DADO una película de una sesión guardada que cambió de estado en mi lista, CUANDO abro la sesión, ENTONCES la sesión no cambió.
- **HU-04-C6.** DADO una sesión guardada, CUANDO la reviso, ENTONCES no hay forma de modificarla ni de eliminarla.
- **HU-04-C7.** DADO que la app está consultando mis sesiones, CUANDO espero, ENTONCES veo que está cargando; si falla, veo un mensaje de error y puedo reintentar.

**INVEST:** I — parcial: necesita sesiones ya guardadas, pero se prueba con sesiones de ejemplo. N — el diseño de la lista y del detalle es negociable. V — cierra el ciclo: guardar sirve si se puede consultar. E — claro. S — un ticket de pantalla sobre el servicio. T — comprobable con datos concretos.

---

## HU-05 — Mantener mis sesiones privadas

> Como usuario, quiero que solo yo pueda ver y modificar mis sesiones, para que mis planes sean privados.

**Criterios de aceptación**

- **HU-05-C1.** DADO que no inicié sesión, CUANDO intento abrir «Noche de película» o mis sesiones, ENTONCES la app me pide iniciar sesión.
- **HU-05-C2.** DADO dos personas con sesiones guardadas, CUANDO una consulta sus sesiones, ENTONCES solo ve las suyas.
- **HU-05-C3.** DADO una sesión de otra persona, CUANDO intento abrirla directamente por su dirección, ENTONCES no la veo, como si no existiera.
- **HU-05-C4.** DADO una sesión de otra persona, CUANDO intento modificarla o eliminarla, aunque lo haga sin usar la pantalla de la aplicación, ENTONCES no es posible y la sesión queda intacta.
- **HU-05-C5.** DADO que intento guardar una sesión a nombre de otra persona, aunque lo haga sin usar la pantalla de la aplicación, ENTONCES no es posible.
- **HU-05-C6.** DADO que no inicié sesión, CUANDO intento leer o guardar sesiones sin usar la pantalla de la aplicación, ENTONCES no es posible.

**INVEST:** I — transversal: se verifica sobre las demás. N — solo la forma de demostrarlo es negociable; la regla no. V — protege la privacidad. E — las pruebas con dos cuentas están definidas. S — un ticket de datos y uno de prueba. T — se demuestra con dos cuentas reales.
