const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

let players={}, foods=[];
for(let i=0;i<200;i++) foods.push({x:Math.random()*3000,y:Math.random()*3000});

function dist(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }

wss.on("connection",ws=>{
  const id=Math.random().toString(36).slice(2);
  ws.on("message",m=>{
    const d=JSON.parse(m);
    if(d.type==="join"){
      players[id]={id,name:d.name,skin:d.skin,x:1500,y:1500,snake:[{x:1500,y:1500}],length:5,color:`hsl(${Math.random()*360},100%,50%)`};
      ws.send(JSON.stringify({type:"init",id,players,foods}));
    }
    if(d.type==="update"&&players[id]){
      let p=players[id];
      p.x=d.x;p.y=d.y;
      p.snake.unshift({x:p.x,y:p.y});
      while(p.snake.length>p.length) p.snake.pop();
      foods.forEach((f,i)=>dist(p,f)<10&&(p.length++,foods[i]={x:Math.random()*3000,y:Math.random()*3000}));
    }
  });
  ws.on("close",()=>delete players[id]);
});

setInterval(()=>wss.clients.forEach(c=>c.send(JSON.stringify({type:"state",players,foods}))),33);
