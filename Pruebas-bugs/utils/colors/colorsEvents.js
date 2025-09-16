let colorsEvents = [
    { background: "#ff5252", colortext: "#000000" },
    { background: "#26c6da", colortext: "#000000" },
    { background: "#FF0000", colortext: "#FFFFFF" }, // Rojo
    { background: "#00FF00", colortext: "#000000" }, // Verde
    { background: "#0000FF", colortext: "#FFFFFF" }, // Azul
    { background: "#FFFF00", colortext: "#000000" }, // Amarillo
    { background: "#FF00FF", colortext: "#FFFFFF" }, // Magenta
    { background: "#00FFFF", colortext: "#000000" }, // Cian
    { background: "#800000", colortext: "#FFFFFF" }, // Marrón
    { background: "#008000", colortext: "#FFFFFF" }, // Verde oscuro
    { background: "#000080", colortext: "#FFFFFF" }, // Azul oscuro
    { background: "#808000", colortext: "#FFFFFF" }, // Oliva
    { background: "#800080", colortext: "#FFFFFF" }, // Morado
    { background: "#008080", colortext: "#000000" }, // Turquesa
    { background: "#808080", colortext: "#000000" }, // Gris
    { background: "#FFA500", colortext: "#000000" }, // Naranja
    { background: "#FFC0CB", colortext: "#000000" }, // Rosa
    { background: "#800000", colortext: "#FFFFFF" }, // Marrón oscuro
    { background: "#FFD700", colortext: "#000000" }, // Oro
    { background: "#ADFF2F", colortext: "#000000" }, // Verde amarillento
    { background: "#20B2AA", colortext: "#000000" }, // Aguamarina
    { background: "#FF69B4", colortext: "#000000" }, // Rosa claro
    { background: "#CD5C5C", colortext: "#FFFFFF" }, // Rojo coral
    { background: "#DA70D6", colortext: "#000000" }, // Orquídea
    { background: "#48D1CC", colortext: "#000000" }, // Azul medio
    { background: "#3CB371", colortext: "#000000" }, // Verde mar
    { background: "#FFA07A", colortext: "#000000" }, // Salmón claro
    { background: "#7B68EE", colortext: "#000000" }, // Azul medio púrpura
    { background: "#DDA0DD", colortext: "#000000" }, // Lavanda
    { background: "#FF7F50", colortext: "#000000" }, // Naranja coral
    { background: "#C71585", colortext: "#FFFFFF" }, // Rojo medio violeta
    { background: "#FF6347", colortext: "#000000" }, // Tomate
    { background: "#40E0D0", colortext: "#000000" }, // Turquesa claro
    { background: "#FF4500", colortext: "#FFFFFF" }, // Naranja rojizo
    { background: "#7CFC00", colortext: "#000000" }, // Verde césped
    { background: "#BA55D3", colortext: "#000000" }, // Orquídea medio
    { background: "#00FA9A", colortext: "#000000" }, // Verde medio
    { background: "#9932CC", colortext: "#FFFFFF" }, // Púrpura oscuro
    { background: "#FF8C00", colortext: "#FFFFFF" }, // Naranja oscuro
    { background: "#BDB76B", colortext: "#000000" }, // Arena
    { background: "#8B008B", colortext: "#FFFFFF" }, // Magenta oscuro
    { background: "#FF1493", colortext: "#000000" }, // Rosa intenso
    { background: "#00BFFF", colortext: "#000000" }, // Azul celeste
    { background: "#8A2BE2", colortext: "#FFFFFF" }, // Azul violáceo
    { background: "#228B22", colortext: "#FFFFFF" }, // Verde bosque
    { background: "#4B0082", colortext: "#FFFFFF" }, // Índigo
    { background: "#FF00FF", colortext: "#FFFFFF" }, // Fucsia
    { background: "#6B8E23", colortext: "#000000" }, // Verde oliva
    { background: "#8B0000", colortext: "#FFFFFF" }, // Rojo oscuro
    { background: "#2F4F4F", colortext: "#FFFFFF" }, // Gris pizarra oscuro
    { background: "#5c6bc0", colortext: "#FFFFFF" },
    { background: "#8bc34a", colortext: "#000000" },
    { background: "#E91E63", colortext: "#FFFFFF" }, // Rosa intenso
    { background: "#9C27B0", colortext: "#FFFFFF" }, // Púrpura
    { background: "#673AB7", colortext: "#FFFFFF" }, // Púrpura profundo
    { background: "#3F51B5", colortext: "#FFFFFF" }, // Índigo claro
    { background: "#2196F3", colortext: "#FFFFFF" }, // Azul
    { background: "#03A9F4", colortext: "#000000" }, // Azul claro
    { background: "#00BCD4", colortext: "#000000" }, // Cian claro
    { background: "#009688", colortext: "#FFFFFF" }, // Verde azulado
    { background: "#4CAF50", colortext: "#000000" }, // Verde material
    { background: "#8BC34A", colortext: "#000000" }, // Verde claro
    { background: "#CDDC39", colortext: "#000000" }, // Lima
    { background: "#FFEB3B", colortext: "#000000" }, // Amarillo material
    { background: "#FFC107", colortext: "#000000" }, // Ámbar
    { background: "#FF9800", colortext: "#000000" }, // Naranja material
    { background: "#FF5722", colortext: "#FFFFFF" }, // Naranja profundo
    { background: "#795548", colortext: "#FFFFFF" }, // Marrón material
    { background: "#9E9E9E", colortext: "#000000" }, // Gris material
    { background: "#607D8B", colortext: "#FFFFFF" }, // Gris azulado
    { background: "#F44336", colortext: "#FFFFFF" }, // Rojo material
    { background: "#E8EAF6", colortext: "#000000" }, // Índigo muy claro
    { background: "#C8E6C9", colortext: "#000000" }, // Verde muy claro
    { background: "#FFCDD2", colortext: "#000000" }, // Rojo muy claro
    { background: "#D1C4E9", colortext: "#000000" }, // Púrpura muy claro
    { background: "#BBDEFB", colortext: "#000000" }, // Azul muy claro
    { background: "#B2DFDB", colortext: "#000000" }, // Verde azulado claro
    { background: "#DCEDC8", colortext: "#000000" }, // Verde lima claro
    { background: "#F0F4C3", colortext: "#000000" }, // Lima muy claro
    { background: "#FFF9C4", colortext: "#000000" }, // Amarillo muy claro
    { background: "#FFECB3", colortext: "#000000" }, // Ámbar claro
    { background: "#FFE0B2", colortext: "#000000" }, // Naranja claro
    { background: "#BCAAA4", colortext: "#000000" }, // Marrón claro
    { background: "#CFD8DC", colortext: "#000000" }, // Gris azulado claro
    { background: "#FF6B6B", colortext: "#000000" }, // Coral suave
    { background: "#4ECDC4", colortext: "#000000" }, // Turquesa suave
    { background: "#45B7D1", colortext: "#000000" }, // Azul cielo
    { background: "#96CEB4", colortext: "#000000" }, // Verde menta
    { background: "#FFEAA7", colortext: "#000000" }, // Amarillo suave
    { background: "#DDA0DD", colortext: "#000000" }, // Ciruela
    { background: "#98D8C8", colortext: "#000000" }, // Menta claro
    { background: "#F7DC6F", colortext: "#000000" }, // Amarillo pastel
    { background: "#BB8FCE", colortext: "#000000" }, // Lila
    { background: "#85C1E9", colortext: "#000000" }, // Azul pastel
    { background: "#F8C471", colortext: "#000000" }, // Naranja pastel
    { background: "#82E0AA", colortext: "#000000" }, // Verde pastel
    { background: "#F1948A", colortext: "#000000" }, // Rosa pastel
    { background: "#85929E", colortext: "#FFFFFF" }, // Gris azul
    { background: "#A569BD", colortext: "#FFFFFF" }, // Púrpura medio
    { background: "#5DADE2", colortext: "#000000" }, // Azul medio claro
    { background: "#58D68D", colortext: "#000000" }, // Verde medio claro
    { background: "#F4D03F", colortext: "#000000" }, // Amarillo dorado
    { background: "#E74C3C", colortext: "#FFFFFF" }, // Rojo carmesí
    { background: "#2E86AB", colortext: "#FFFFFF" }, // Azul petróleo
    { background: "#A23B72", colortext: "#FFFFFF" }  // Magenta oscuro
];

  

export default colorsEvents;