$( document ).ready(function() {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    
    let alive = [];
    
    setInterval(function(){
        render();
        
    }, 10);
    
  //   setInterval(function(){
  //     setInterval(function(){
  //       let fireBall_data = {}
  //       fireBall_data.radius      = 7;
  //       fireBall_data.x           = player.details.x + (player.details.w/2)
  //       fireBall_data.y           = player.details.y - (fireBall_data.radius*2)
  //       fireBall_data.color       = "green";
  //       fireBall_data.borderColor = "#003300";
  //       fireBall_data.direction   = "up"; 
  
  //       var fireBall = new FireBall(fireBall_data, "red")
  //       alive.push(fireBall)
  //       // console.log("time",Math.floor(Math.random() * 10))
  //     }, Math.floor(Math.random*10));
      
  // }, 5000);
    
    class FireBall {
      constructor(details, color) {
        this.details  = details
        this.color = color
        this.type  = "ball"
        this.alive = true;
        this.direction = details.direction
      }
    
      draw() {
      if(this.alive){
        ctx.beginPath();
        if(this.direction == "up"){
        this.details.y -= 1;
        }else{
          this.details.y += 1;
        }
        ctx.arc(this.details.x, this.details.y, this.details.radius, 0, 2 * Math.PI, false);
        
        ctx.fillStyle = this.details.color;
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = this.details.borderColor;
        ctx.stroke();
        }
      }
    }
    
    
    class Player{

      constructor(details, color) {
        this.details   = details
        this.color     = color
        this.fire      = false
        this.type      = "player"
        this.alive     = true
        this.direction = this.details.direction
        this.sensor    = this.details.sensor;
      
      }
    
      draw() {
        if(this.alive){
        
        console.log(this.redZone)
        if(!this.redZone){
          if(this.direction == "right"){
            this.details.x += this.details.vel
          }
                    
          if(this.direction == "left"){
              this.details.x -= this.details.vel
          }

        }
          
          ctx.fillStyle = this.color
          ctx.fillRect(this.details.x, this.details.y, this.details.w, this.details.h)
        }
      }
    }
    
  let enemy_data = {
      x : 50,
      y : 0,
      w : 50,
      h : 15,
      direction: "left",
      vel : 1,
      sensor: true
  }
  

  let enemy = new Player(enemy_data, "blue")
  enemy.draw()
  alive.push(enemy)
  
  let player_data = {
    x : 15,
    y : c.height - 15,
    w : 50,
    h : 15,
    direction: "right",
    vel : 1,
    sensor: false
  }

  let player = new Player(player_data, "red")
  player.draw()
  alive.push(player)
     
  function render(){
    ctx.clearRect(0, 0, c.width, c.height);
    
    alive.forEach((element,index) => {
      switch (element.type) {
        case "player":

          if(element.details.x + element.details.w  >= c.width){
            element.direction = "left"; 
          }
          
          if(element.details.x <= 0){
            element.direction = "right"; 
          }
          
          break;
          
        case "ball":
          if(element.details.direction == "up"){
            if(element.details.y + element.details.radius <= 0){
              alive.splice(index, 1); 
            }
          }
          
          break;
      
        default:
          break;
      }

      
    });
    
    alive.forEach(element => {
      
      element.draw()
    });
   

}
    
  document.addEventListener('keydown', (event) => {
      let name = event.key;
      let code = event.code;
      
      if(name == "ArrowRight"){
          player.direction = "right";
        
      }else if(name == "ArrowLeft"){
          player.direction = "left";      
      }
      
      if(code == "Space"){ 
        let fireBall_data = {}
        fireBall_data.radius      = 7;
        fireBall_data.x           = player.details.x + (player.details.w/2)
        fireBall_data.y           = player.details.y - (fireBall_data.radius*2)
        fireBall_data.color       = "green";
        fireBall_data.borderColor = "#003300";
        fireBall_data.direction   = "up"; 
  
        var fireBall = new FireBall(fireBall_data, "red")
        alive.push(fireBall)
      }
    }, false);
});