module.exports = {
    apps: [{
      name: "repfora-3000",
      script: "app.js", 
      node_args: "--experimental-specifier-resolution=node",  // Opcional para evitar problemas de importación
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }]
  };