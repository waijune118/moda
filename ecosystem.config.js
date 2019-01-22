module.exports = {
  apps : [{
    name        : "webapp",
    script      : "./app.js",
    watch       : true,
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    }
  }]
}
