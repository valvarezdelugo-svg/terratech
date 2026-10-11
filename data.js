/* ============================================================
   MINI BASE DE DATOS LOCAL (FICTICIA)
   pos = posición en % sobre el mapa (x: izquierda→derecha, y: arriba→abajo)
   img = ruta de tus PNG. Si no existen, se muestra un ícono de respaldo.
   ============================================================ */
const DB = [
  {
    id:'casa1', tipo:'casa', nombre:'Casa Los Aromos', corto:'Los Aromos',
    comuna:'Viña del Mar', region:'Región de Valparaíso',
    img:'assets/casa1.png', pos:{x:26,y:58},
    precio:6800, superficie:420, construida:135, dormitorios:4, banos:3, suelo:'Urbano',
    resumen:'Casa familiar cerca de la costa, con buena conectividad. La cercanía al mar la hace atractiva, pero la expone a sismos y tsunami.',
    alerta:{nivel:'mid', texto:'Parte de la zona está dentro de la cota de evacuación por tsunami.'},
    riesgos:{sismo:78, tsunami:55, inundacion:20, incendio:45, remocion:40, volcanico:5, sequia:50},
    aptitudes:{residencial:78, agricultura:15, pesca:30, industrial:20, turismo:74, forestal:10},
    historial:[
      {anio:1985, tipo:'sismo', titulo:'Terremoto de la zona central', detalle:'Daños en viviendas antiguas y cortes de servicios básicos por varios días.', gravedad:4},
      {anio:2010, tipo:'tsunami', titulo:'Alerta y marejadas tras terremoto', detalle:'Evacuación preventiva de sectores bajos; daños menores en borde costero.', gravedad:3},
      {anio:2014, tipo:'incendio', titulo:'Incendio en cerros cercanos', detalle:'Se perdieron viviendas en quebradas a 2 km. La zona quedó sin daño directo.', gravedad:3},
      {anio:2019, tipo:'inundacion', titulo:'Anegamientos por sistema frontal', detalle:'Calles anegadas por 48 horas.', gravedad:2},
      {anio:2021, tipo:'sequia', titulo:'Restricción hídrica', detalle:'Racionamiento de agua en verano.', gravedad:2}
    ]
  },
  {
    id:'casa2', tipo:'casa', nombre:'Casa Mirador Cordillera', corto:'Mirador Cordillera',
    comuna:'Lo Barnechea', region:'Región Metropolitana',
    img:'assets/casa2.png', pos:{x:64,y:30},
    precio:12400, superficie:780, construida:210, dormitorios:5, banos:4, suelo:'Urbano',
    resumen:'Casa amplia con vista a la cordillera. Bajo riesgo de inundación y tsunami, pero expuesta a incendios y a aluviones en quebradas.',
    alerta:{nivel:'bad', texto:'Cercana a una quebrada con historial de aluviones y a pastizales secos.'},
    riesgos:{sismo:70, tsunami:0, inundacion:10, incendio:65, remocion:60, volcanico:8, sequia:70},
    aptitudes:{residencial:70, agricultura:25, pesca:0, industrial:15, turismo:55, forestal:40},
    historial:[
      {anio:1993, tipo:'remocion', titulo:'Aluvión en quebrada', detalle:'Flujo de barro bloqueó caminos de acceso por una semana.', gravedad:4},
      {anio:2010, tipo:'sismo', titulo:'Terremoto de la zona central', detalle:'Daños menores en estructuras; sin víctimas en el sector.', gravedad:3},
      {anio:2017, tipo:'incendio', titulo:'Incendio de interfaz urbano-forestal', detalle:'Evacuación de cinco manzanas aledañas.', gravedad:3},
      {anio:2022, tipo:'sequia', titulo:'Megasequía: déficit de lluvias', detalle:'Pérdida de áreas verdes y aumento del riesgo de incendio.', gravedad:2}
    ]
  },
  {
    id:'casa3', tipo:'casa', nombre:'Casa del Lago', corto:'Del Lago',
    comuna:'Puerto Varas', region:'Región de Los Lagos',
    img:'assets/casa3.png', pos:{x:78,y:70},
    precio:7900, superficie:1100, construida:160, dormitorios:3, banos:2, suelo:'Rural residencial',
    resumen:'Casa con vista al lago, ideal como vivienda o segunda residencia. El riesgo principal es sísmico y volcánico; el clima es poco propenso a sequía.',
    alerta:{nivel:'mid', texto:'En el área de influencia de caída de ceniza de un volcán activo.'},
    riesgos:{sismo:72, tsunami:10, inundacion:40, incendio:20, remocion:35, volcanico:62, sequia:10},
    aptitudes:{residencial:72, agricultura:40, pesca:45, industrial:10, turismo:88, forestal:35},
    historial:[
      {anio:1960, tipo:'sismo', titulo:'Gran terremoto del sur', detalle:'Daños severos en la región; reconstrucción de gran parte de la ciudad.', gravedad:5},
      {anio:2015, tipo:'volcanico', titulo:'Erupción y caída de ceniza', detalle:'Suspensión de actividades por dos semanas y daños en cultivos cercanos.', gravedad:3},
      {anio:2017, tipo:'inundacion', titulo:'Desborde de río por lluvias', detalle:'Cortes de camino y anegamiento de sectores bajos.', gravedad:2}
    ]
  },
  {
    id:'Terreno1', tipo:'terreno', nombre:'Parcela Valle Verde', corto:'Valle Verde',
    comuna:'Casablanca', region:'Región de Valparaíso',
    img:'assets/terreno1.png', pos:{x:42,y:34},
    precio:3200, superficie:120000, suelo:'Rural agrícola',
    resumen:'Suelo fértil, buen drenaje y acceso a agua de riego: excelente para cultivos y viñedos. No es recomendable para vivienda porque una falla geológica atraviesa el predio.',
    alerta:{nivel:'bad', texto:'Falla geológica activa a 300 m: no se recomienda construir viviendas.'},
    riesgos:{sismo:85, tsunami:0, inundacion:10, incendio:35, remocion:15, volcanico:3, sequia:55},
    aptitudes:{residencial:18, agricultura:92, pesca:0, industrial:40, turismo:50, forestal:60},
    historial:[
      {anio:1971, tipo:'sismo', titulo:'Sismo con ruptura superficial', detalle:'Grietas en el terreno; sin daño relevante en cultivos.', gravedad:3},
      {anio:2010, tipo:'sismo', titulo:'Terremoto de la zona central', detalle:'Daños en bodegas y cercos; los cultivos no se vieron afectados.', gravedad:3},
      {anio:2016, tipo:'sequia', titulo:'Años secos consecutivos', detalle:'Menor caudal de riego; se necesitó riego tecnificado.', gravedad:2},
      {anio:2020, tipo:'incendio', titulo:'Incendio de pastizales vecinos', detalle:'Fuego detenido en el cortafuegos del predio.', gravedad:2}
    ]
  },
  {
    id:'terreno2', tipo:'terreno', nombre:'Terreno Caleta Piedra Azul', corto:'Piedra Azul',
    comuna:'Pichilemu', region:'Región de O\'Higgins',
    img:'assets/terreno2.png', pos:{x:18,y:80},
    precio:1900, superficie:8500, suelo:'Costero',
    resumen:'Frente a una caleta de pescadores, con acceso a mar y buen potencial turístico y de pesca. Por el riesgo de tsunami no conviene destinarlo a vivienda permanente.',
    alerta:{nivel:'bad', texto:'Dentro de la zona de inundación por tsunami: evita uso residencial permanente.'},
    riesgos:{sismo:70, tsunami:85, inundacion:45, incendio:30, remocion:40, volcanico:2, sequia:40},
    aptitudes:{residencial:25, agricultura:20, pesca:90, industrial:35, turismo:80, forestal:15},
    historial:[
      {anio:1985, tipo:'sismo', titulo:'Terremoto de la zona central', detalle:'Daños en muelle y embarcaciones menores.', gravedad:3},
      {anio:2010, tipo:'tsunami', titulo:'Tsunami posterior al terremoto', detalle:'Ola que ingresó 200 m tierra adentro; destrucción de la caleta.', gravedad:5},
      {anio:2010, tipo:'sismo', titulo:'Terremoto de 8,8', detalle:'Daños importantes en infraestructura costera.', gravedad:4},
      {anio:2015, tipo:'inundacion', titulo:'Marejadas e inundación costera', detalle:'Daños en accesos y bodegas de pesca.', gravedad:2},
      {anio:2018, tipo:'remocion', titulo:'Deslizamiento en ladera', detalle:'Corte del camino de acceso por tres días.', gravedad:2}
    ]
  }
];
