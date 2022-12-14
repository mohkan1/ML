$( document ).ready(function() {
    let c = document.getElementById("myCanvas");
    c.width = screen.width/1.1;
    c.height = screen.height/1.5;

    c_height = c.height;
    c_width = c.width;
  
    let render_time = 10;
    var ctx = c.getContext("2d");
    
    let alive = [];
    let score = 0;
    const { Layer, Network } = window.synaptic;

    var learningRate = .6;
    var inputLayer_defense = new Layer(2);
    var hiddenLayer_defense = new Layer(3);
    var outputLayer_defense = new Layer(2);
  
    var defense = new Network({
      input: inputLayer_defense,
      hidden: [hiddenLayer_defense],
      output: outputLayer_defense
    });


    inputLayer_defense.project(hiddenLayer_defense);
    hiddenLayer_defense.project(outputLayer_defense);

    var inputLayer_follow = new Layer(1);
    var hiddenLayer_follow = new Layer(3);
    var outputLayer_follow = new Layer(1);

    var follow = new Network({
      input: inputLayer_follow,
      hidden: [hiddenLayer_follow],
      output: outputLayer_follow
    });
  
    inputLayer_follow.project(hiddenLayer_follow);
    hiddenLayer_follow.project(outputLayer_follow);
    
    var inputLayer_fire = new Layer(1);
    var hiddenLayer_fire = new Layer(3);
    var outputLayer_fire = new Layer(1);

    var fire_network = new Network({
      input: inputLayer_fire,
      hidden: [hiddenLayer_fire],
      output: outputLayer_fire
    });
  
    inputLayer_fire.project(hiddenLayer_fire);
    hiddenLayer_fire.project(outputLayer_fire);

    
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
        this.details.y -= this.details.vel;
        }else{
          this.details.y += this.details.vel;
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

      constructor(details) {
        this.details   = details
        this.color     = this.details.color
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
          
          ctx.fillStyle = this.details.color
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
      vel : 2,
      sensor: true,
      color: "blue",
  }
  
  
  
  let enemy = new Player(enemy_data)
  enemy.draw()
  alive.push(enemy);
  
  let old_enemy_vel = enemy.details.vel;
  
  let player_data = {
    x : 15,
    y : c.height - 15,
    w : 50,
    h : 15,
    direction: "right",
    vel : 3,
    sensor: false,
    color:"red"
  }

  let player = new Player(player_data)
  player.draw()
  alive.push(player)
  let counter = 0;
    
  setInterval(function(){
    let right = 0;
    let left  = 0;
    let dangerZone_balls = 0;
    
    var diff = Math.abs((player.details.x - enemy.details.x)/c_width);
    let fire_predict = fire_network.activate([ diff ]);

    if(fire_predict > 0.5){  
      // fire
      counter += 1;
      if(counter % 100 == 0){
        let fireBall_data = {}
        random_radius = Math.floor(Math.random()*15);
        
        while(random_radius < 7){
          random_radius = Math.floor(Math.random()*15);
        
        }
        
        fireBall_data.radius      = random_radius;
        fireBall_data.x           = enemy.details.x + (enemy.details.w/2)
        fireBall_data.y           = enemy.details.y + (fireBall_data.radius*2)
        fireBall_data.color       = "purple";
        fireBall_data.borderColor = "#003300";
        fireBall_data.direction   = "down";
        fireBall_data.team        = "enemy";
        
        let random_vel = Math.floor(Math.random()*5);
        while(random_vel < 2){
          random_vel = Math.floor(Math.random()*5);
          
        }
        
        fireBall_data.vel = random_vel;
        
        var fireBall = new FireBall(fireBall_data, "purple");
        alive.push(fireBall);
      
      }
    }
    
    
    alive.forEach(element => {
      if(element.type == "ball"){
        // if(element.details.x > enemy.details.x && element.details.x < (enemy.details.x + enemy.details.w)){
          // let distance = Math.sqrt( parseInt((element.details.x - enemy.details.x) / c_width)**2 + parseInt(((element.details.y - enemy.details.y)/ c_height)**2));
          if(element.details.team == "player"){
            
            if(element.details.x > (enemy.details.x  + (enemy.details.w/2) )){
              // Turn left
              left += 1;
  
             } 
             
             if (element.details.x < (enemy.details.x + (enemy.details.w/2) ) ){
              // Turn right
              right += 1;
            
             }
             
             if(element.details.x > enemy.details.x && element.details.x < (enemy.details.x + enemy.details.w)){
              dangerZone_balls+= 1;
             }
             
          }

          
          }
          
          // }
          
        });
        
        if(left > 0 || right > 0){

          let predict = defense.activate([ left, right, dangerZone_balls/(left+right)]);
          console.log("predict", predict);
          if(predict[1] > 0.5){
            enemy.direction = "";
          }else{

            if(predict[0] > 0.5){        
              enemy.direction = "right";
            }else{
              enemy.direction = "left";
            }
            
          }        

      
        }else{
          var diff = (player.details.x - enemy.details.x)/c_width;
          let predict_follow = follow.activate([ diff ]);
          
          
          if(predict_follow > 0.6){        
            enemy.direction = "right";
          }else{
            enemy.direction = "left";
          }

        }
        
        
        
    
  }, render_time);
  
 
     
  
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
          
          if(element.details.direction == "down"){
            if(element.details.y + element.details.radius >= c_height){
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
          let right = 0;
          let left  = 0;
          let dangerZone_balls = 0;
          alive.forEach(ball => {
            if(ball.type == "ball"){
              
              // let distance = Math.sqrt( parseInt((ball.details.x - enemy.details.x) / c_width)**2 + parseInt(((ball.details.y - enemy.details.y)/c_height)**2));
              if(ball.details.team == "player"){

                if(ball.details.x > (enemy.details.x  + (enemy.details.w/2) )){
                 // Turn left
                 left += 1;
  
                } 
                
                if (ball.details.x < (enemy.details.x + (enemy.details.w/2) ) ){
                 // Turn right
                 right += 1;
               
                }
                
                if(ball.details.x > obj.details.x && ball.details.x < (obj.details.x + obj.details.w)){
                  color = "#8A1800";
                  dangerZone_balls += 1;
                  // Danger zone
                  if(ball.details.x > enemy.details.x && ball.details.x < (enemy.details.x + enemy.details.w)){
                    if(ball.details.y > enemy.details.y && ball.details.y < (enemy.details.y + enemy.details.h)){
                    score += 1;
                    $("#score").text(score)
                    enemy.details.color = "white"; 
                  }else{
                    enemy.details.color = "blue"; 
  
                  }
                    
                 }
                 
                }
                
              }
            }

          });

          fire = 0;
          if(Math.abs((player.details.x - enemy.details.x)/c_width) < 0.2){
            fire = 1;
          }
          
          fire_network.activate([ Math.abs((player.details.x - enemy.details.x)/c_width) ]);  
          fire_network.propagate(learningRate, [fire]);
          
          if(left > 0 || right > 0){
            if(dangerZone_balls == 0){
              // Dont move
              defense.activate([ left, right, dangerZone_balls/(left+right)]);  
              defense.propagate(learningRate, [0, 1]);            
            }else{
                      
                  
              if(left > 0 && right == 0){
                defense.activate([ left, right, dangerZone_balls/(left+right)]);  
                defense.propagate(learningRate, [0, 0]);
              }
              
              if(right > 0 && left == 0){
                defense.activate([ left, right, dangerZone_balls/(left+right)]);  
                defense.propagate(learningRate, [1, 0]);
              }
              
              alive.forEach((ball, index) => {
                if(ball.type == "ball" && ball.details.team == "player"){
                    ball_vel = ball.details.vel;
                    ball_x = ball.details.x;
                    ball_y = ball.details.y;
                    delta_y = ball.details.y - (enemy.details.y + enemy.details.h); 
                    delta_x = ball.details.x - (enemy.details.x + (enemy.details.w/2)); 
                    
                    if(delta_x > 0){
                        ball_to_enemy_time = delta_y/ball_vel;
                        enemy.details.vel = ball_vel*2;
                        enemy_to_ball_time = (delta_x/enemy.details.vel) + enemy.details.w + enemy.details.w*0.2;
                        
                        if(enemy_to_ball_time < ball_to_enemy_time){
                          defense.activate([ left, right, dangerZone_balls/(left+right)]);  
                          defense.propagate(learningRate, [0, 0]);
                        }else{
                          if(left > right){
                            defense.activate([ left, right, dangerZone_balls/(left+right)]);  
                            defense.propagate(learningRate, [0, 0]);
                          }else{
                            defense.activate([ left, right, dangerZone_balls/(left+right)]);  
                            defense.propagate(learningRate, [1, 0]);
                          }
                        }
                    }else{
                      ball_to_enemy_time = delta_y/ball_vel;
                      enemy.details.vel = ball_vel*2;
                      enemy_to_ball_time = delta_x/enemy.details.vel + enemy.details.w + enemy.details.w*0.1;

                      if(enemy_to_ball_time < ball_to_enemy_time){
                        defense.activate([ left, right, dangerZone_balls/(left+right)]);  
                        defense.propagate(learningRate, [1, 0]);
                      }else{
                        if(left > right){
                          defense.activate([ left, right, dangerZone_balls/(left+right)]);  
                          defense.propagate(learningRate, [0, 0]);
                        }else{
                          defense.activate([ left, right, dangerZone_balls/(left+right)]);  
                          defense.propagate(learningRate, [1, 0]);
                        }
                      }
                
                    }

                }
              
              });



              // if(right > left){
              //   // Turn left
              //   defense.activate([ left, right, dangerZone_balls ]);  
              //   defense.propagate(learningRate, [0, 0]);  
              // }else if (right > left){
              //   // Turn right
              //   defense.activate([ left, right, dangerZone_balls]);  
              //   defense.propagate(learningRate, [1, 0]);  
              // }
              
            }
            
          }else{
              enemy.details.vel = old_enemy_vel;
              let diff = (player.details.x - enemy.details.x)/c_width;
              

                
              if(player.details.x > enemy.details.x){
                follow.activate([ diff ]);  
                follow.propagate(learningRate, [1]);
              }else{
                follow.activate([ diff ]);  
                follow.propagate(learningRate, [0]);
              }

          }

          
      
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
        random_radius = Math.floor(Math.random()*15);
        
        while(random_radius < 7){
          random_radius = Math.floor(Math.random()*15);
        
        }
        
        fireBall_data.radius      = random_radius;
        
        fireBall_data.x           = player.details.x + (player.details.w/2)
        fireBall_data.y           = player.details.y - (fireBall_data.radius*2)
        fireBall_data.color       = "green";
        fireBall_data.borderColor = "#003300";
        fireBall_data.direction   = "up";
        fireBall_data.team        = "player";
        
        let random_vel = Math.floor(Math.random()*5);
        while(random_vel < 2){
          random_vel = Math.floor(Math.random()*5);
        
        }
        
        fireBall_data.vel = random_vel;
  
        var fireBall = new FireBall(fireBall_data, "red");
        alive.push(fireBall);

      

      }
    }, false);

});