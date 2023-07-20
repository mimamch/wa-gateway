module.exports = {
    apps : [
    {
      name      : "Start WA-Gateway with PM2",
      script    : "./index.js",
      instances : "1",
      exec_mode : "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3007    
      }
    }
    ]
  }