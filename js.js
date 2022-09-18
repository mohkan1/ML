$( document ).ready(function() {
    var c = document.getElementById("myCanvas");
    c.width = screen.width/1.1;
    c.height = screen.height/1.2;

    var ctx = c.getContext("2d");
    
    let alive = [];

    const { Layer, Network } = window.synaptic;

    var inputLayer = new Layer(2);
    var hiddenLayer = new Layer(3);
    var outputLayer = new Layer(1);
  
    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);
    
  
    var myNetwork = new Network({
      input: inputLayer,
      hidden: [hiddenLayer],
      output: outputLayer
    });
  
    var learningRate = .8;
    
    setInterval(function(){
        render();
    }, 10);
    

    
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
        this.details.y -= Math.floor(Math.random()*10);
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
      vel : 5,
      sensor: true
  }
  

  let enemy = new Player(enemy_data, "blue")
  enemy.draw()
  alive.push(enemy);
  
  
    
  setInterval(function(){
    alive.forEach(element => {
      if(element.type == "ball"){
        if(element.details.x > enemy.details.x && element.details.x < (enemy.details.x + enemy.details.w)){

          let predict = myNetwork.activate([element.details.x, element.details.y]);
          console.log("Prediction", predict);
          if(predict > 0.5){        
            if(enemy.direction == "right"){
                enemy.direction = "left";
            }else if(enemy.direction == "left"){
                enemy.direction = "right";
            }
          }
          
        }
      }
      
    });
  }, 10);
  
  let player_data = {
    x : 15,
    y : c.height - 15,
    w : 50,
    h : 15,
    direction: "right",
    vel : 10,
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
    let counter = 1;
    alive.forEach(obj => {
      obj.draw();

      if(obj.type == "player"){
        if(obj.sensor){
        
          let color = "black";
          alive.forEach(element => {
            if(element.type == "ball"){
              if(element.details.x > obj.details.x && element.details.x < (obj.details.x + obj.details.w)){
                color = "#8A1800";
                // Danger zone
                myNetwork.activate([element.details.x, element.details.y]);  
                myNetwork.propagate(learningRate, [1]);   
                   
              }
              // else{
              //   myNetwork.activate([element.details.x, element.details.y]);  
              //   myNetwork.propagate(learningRate, [0]); 

              // }
            }

          });
      
          ctx.fillStyle = color;
          ctx.fillRect(obj.details.x, obj.details.y + obj.details.h, obj.details.w, c.height)
          
        }
      }
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
  
        var fireBall = new FireBall(fireBall_data, "red");
        alive.push(fireBall);
        console.log("hiddenLayer", hiddenLayer);

      

      }
    }, false);

    setInterval(function(){
      let fireBall_data = {}
      fireBall_data.radius      = 7;
      fireBall_data.x           = player.details.x + (player.details.w/2)
      fireBall_data.y           = player.details.y - (fireBall_data.radius*2)
      fireBall_data.color       = "green";
      fireBall_data.borderColor = "#003300";
      fireBall_data.direction   = "up"; 

      var fireBall = new FireBall(fireBall_data, "red");
      alive.push(fireBall);
  }, 5);


});