var CanvasParticle = (function(){
	function getElementByTag(name){
		return document.getElementsByTagName(name);
	}
	function getELementById(id){
		return document.getElementById(id);
	}
	// 根据传入的config初始化画布
	function canvasInit(canvasConfig){
		canvasConfig = canvasConfig || {};
		var html = getElementByTag("html")[0];
		// 获取body作为背景
		// var body = getElementByTag("body")[0];

		// 获取特定div作为背景
		// mydiv是你想要将其作为背景的div的ID
		var body = document.getElementById("mydiv");
		var canvasObj = document.createElement("canvas");

		var canvas = {
			element: canvasObj,
			points : [],
			// 默认配置
			config: {
				vx: canvasConfig.vx || 4,
				vy:  canvasConfig.vy || 4,
				height: canvasConfig.height || 2,
				width: canvasConfig.width || 2,
				count: canvasConfig.count || 100,
				color: canvasConfig.color || "121, 162, 185",
				stroke: canvasConfig.stroke || "130,255,255",
				dist: canvasConfig.dist || 6000,
				e_dist: canvasConfig.e_dist || 20000,
				max_conn: 10
			}
		};

		// 获取context
		if(canvas.element.getContext("2d")){
			canvas.context = canvas.element.getContext("2d");
		}else{
			return null;
		}

		body.style.padding = "0";
		body.style.margin = "0";
		// body.replaceChild(canvas.element, canvasDiv);
		body.appendChild(canvas.element);

		canvas.element.style = "position: fixed; top: 0; left: 0; z-index: -1;";
		canvasSize(canvas.element);
		window.onresize = function(){
			canvasSize(canvas.element);
		}
		body.onmousemove = function(e){
			var event = e || window.event;
			canvas.mouse = {
				x: event.clientX,
				y: event.clientY
			}
		}
		document.onmouseleave = function(){
			canvas.mouse = undefined;
		}
		setInterval(function(){
			drawPoint(canvas);
		}, 40);
	}

	// 设置canvas大小
	function canvasSize(canvas){
		// 获取窗口的宽高
		// canvas.width = window.innerWeight || document.documentElement.clientWidth || document.body.clientWidth;
		// canvas.height = window.innerWeight || document.documentElement.clientHeight || document.body.clientHeight;

		// 获取特定div的宽高
		var width = document.getElementById("mydiv").style.width;
		var height = document.getElementById("mydiv").style.height;
		width = parseInt(width);
		height = parseInt(height);
		canvas.width = width || window.innerWeight || document.documentElement.clientWidth || document.body.clientWidth;
		canvas.height = height || window.innerWeight || document.documentElement.clientHeight || document.body.clientHeight;
	}

	// 画点
	function drawPoint(canvas){
		var context = canvas.context,
			point,
			dist;
		context.clearRect(0, 0, canvas.element.width, canvas.element.height);
		context.beginPath();
		context.fillStyle = "rgb("+ canvas.config.color +")";
		for(var i = 0, len = canvas.config.count; i < len; i++){
			if(canvas.points.length != canvas.config.count){
				// 初始化所有点
				point = {
					x: Math.floor(Math.random() * canvas.element.width),
					y: Math.floor(Math.random() * canvas.element.height),
					vx: canvas.config.vx / 2 - Math.random() * canvas.config.vx,
					vy: canvas.config.vy / 2 - Math.random() * canvas.config.vy
				}
			}else{
				// 处理球的速度和位置，并且做边界处理
				point =	borderPoint(canvas.points[i], canvas);
			}
			context.fillRect(point.x - canvas.config.width / 2, point.y - canvas.config.height / 2, canvas.config.width, canvas.config.height);

			canvas.points[i] = point;
		}
		drawLine(context, canvas, canvas.mouse);
		context.closePath();
	}

	// 边界处理
	function borderPoint(point, canvas){
		var p = point;
		if(point.x <= 0 || point.x >= canvas.element.width){
			p.vx = -p.vx;
			p.x += p.vx;
		}else if(point.y <= 0 || point.y >= canvas.element.height){
			p.vy = -p.vy;
			p.y += p.vy;
		}else{
			p = {
				x: p.x + p.vx,
				y: p.y + p.vy,
				vx: p.vx,
				vy: p.vy
			}
		}
		return p;
	}

	// 画线
	function drawLine(context, canvas, mouse){
		context = context || canvas.context;
		for(var i = 0, len = canvas.config.count; i < len; i++){
			// 初始化最大连接数
			canvas.points[i].max_conn = 0;
			// point to point
			for(var j = 0; j < len; j++){
				if(i != j){
					dist = Math.round(canvas.points[i].x - canvas.points[j].x) * Math.round(canvas.points[i].x - canvas.points[j].x) + 
							Math.round(canvas.points[i].y - canvas.points[j].y) * Math.round(canvas.points[i].y - canvas.points[j].y);
					// 两点距离小于吸附距离，而且小于最大连接数，则画线
					if(dist <= canvas.config.dist && canvas.points[i].max_conn <canvas.config.max_conn){
						canvas.points[i].max_conn++;
						// 距离越远，线条越细，而且越透明
						context.lineWidth = 0.5 - dist / canvas.config.dist;
						context.strokeStyle = "rgba("+ canvas.config.stroke + ","+ (1 - dist / canvas.config.dist) +")"
						context.beginPath();
						context.moveTo(canvas.points[i].x, canvas.points[i].y);
						context.lineTo(canvas.points[j].x, canvas.points[j].y);
						context.stroke();

					}
				}
			}
			// 如果鼠标进入画布
			// point to mouse
			if(mouse){
				dist = Math.round(canvas.points[i].x - mouse.x) * Math.round(canvas.points[i].x - mouse.x) + 
						Math.round(canvas.points[i].y - mouse.y) * Math.round(canvas.points[i].y - mouse.y);
				// 遇到鼠标吸附距离时加速，直接改变point的x，y值达到加速效果
				if(dist > canvas.config.dist && dist <= canvas.config.e_dist){
					canvas.points[i].x = canvas.points[i].x + (mouse.x - canvas.points[i].x) / 20;
					canvas.points[i].y = canvas.points[i].y + (mouse.y - canvas.points[i].y) / 20;
				}
				if(dist <= canvas.config.e_dist){
					context.lineWidth = 1;
					context.strokeStyle = "rgba("+ canvas.config.stroke + ","+ (1 - dist / canvas.config.e_dist) +")";
					context.beginPath();
					context.moveTo(canvas.points[i].x, canvas.points[i].y);
					context.lineTo(mouse.x, mouse.y);
					context.stroke();
				}
			}
		}
	}
	return canvasInit;
})();

window.onload = function(){
    //配置
    var config = {
        vx: 4,//点x轴速度,正为右，负为左
        vy:  4,//点y轴速度
        height: 2,//点高宽，其实为正方形，所以不宜太大
        width: 2,
        count: 100,//点个数
        color: "121, 162, 185",//点颜色
        stroke: "130,255,255",//线条颜色
        dist: 6000,//点吸附距离
        e_dist: 20000,//鼠标吸附加速距离
        max_conn: 10//点到点最大连接数
    }
    //调用
    // CanvasParticle(config);
}


var CanvasParticle1 = function(){
  var canvas = document.querySelector('canvas'),
      ctx = canvas.getContext('2d')
	var canvasContainer = document.getElementById('canvas-container');
  canvas.width = canvasContainer.offsetWidth-2;
  canvas.height = canvasContainer.offsetHeight-2;
  ctx.lineWidth = .3;
  ctx.strokeStyle = (new Color(150)).style;

  var mousePosition = {
    x: 30 * canvas.width / 100,
    y: 30 * canvas.height / 100
  };

  var dots = {
    nb: 150,
    distance: 50,
    d_radius: 100,
    array: []
  };

  function colorValue(min) {
    return Math.floor(Math.random() * 255 + min);
  }

  function createColorStyle(r,g,b) {
    return 'rgba(' + r + ',' + g + ',' + b + ', 0.8)';
  }

  function mixComponents(comp1, weight1, comp2, weight2) {
    return (comp1 * weight1 + comp2 * weight2) / (weight1 + weight2);
  }

  function averageColorStyles(dot1, dot2) {
    var color1 = dot1.color,
        color2 = dot2.color;

    var r = mixComponents(color1.r, dot1.radius, color2.r, dot2.radius),
        g = mixComponents(color1.g, dot1.radius, color2.g, dot2.radius),
        b = mixComponents(color1.b, dot1.radius, color2.b, dot2.radius);
    return createColorStyle(Math.floor(r), Math.floor(g), Math.floor(b));
  }

  function Color(min) {
    min = min || 0;
    this.r = colorValue(min);
    this.g = colorValue(min);
    this.b = colorValue(min);
    this.style = createColorStyle(this.r, this.g, this.b);
  }

  function Dot(){
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;

    this.vx = -.5 + Math.random();
    this.vy = -.5 + Math.random();

    this.radius = Math.random() * 2;

    this.color = new Color();
    console.log(this);
  }

  Dot.prototype = {
    draw: function(){
      ctx.beginPath();
      ctx.fillStyle = this.color.style;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fill();
    }
  };

  function createDots(){
    for(i = 0; i < dots.nb; i++){
      dots.array.push(new Dot());
    }
  }

  function moveDots() {
    for(i = 0; i < dots.nb; i++){

      var dot = dots.array[i];

      if(dot.y < 0 || dot.y > canvas.height){
        dot.vx = dot.vx;
        dot.vy = - dot.vy;
      }
      else if(dot.x < 0 || dot.x > canvas.width){
        dot.vx = - dot.vx;
        dot.vy = dot.vy;
      }
      dot.x += dot.vx;
      dot.y += dot.vy;
    }
  }

  function connectDots() {
    for(i = 0; i < dots.nb; i++){
      for(j = 0; j < dots.nb; j++){
        i_dot = dots.array[i];
        j_dot = dots.array[j];

        if((i_dot.x - j_dot.x) < dots.distance && (i_dot.y - j_dot.y) < dots.distance && (i_dot.x - j_dot.x) > - dots.distance && (i_dot.y - j_dot.y) > - dots.distance){
          if((i_dot.x - mousePosition.x) < dots.d_radius && (i_dot.y - mousePosition.y) < dots.d_radius && (i_dot.x - mousePosition.x) > - dots.d_radius && (i_dot.y - mousePosition.y) > - dots.d_radius){
            ctx.beginPath();
            ctx.strokeStyle = averageColorStyles(i_dot, j_dot);
            ctx.moveTo(i_dot.x, i_dot.y);
            ctx.lineTo(j_dot.x, j_dot.y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
    }
  }

  function drawDots() {
    for(i = 0; i < dots.nb; i++){
      var dot = dots.array[i];
      dot.draw();
    }
  }

  function animateDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveDots();
    connectDots();
    drawDots();

    requestAnimationFrame(animateDots);
  }

  $('canvas').on('mousemove', function(e){
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
  });

  $('canvas').on('mouseleave', function(e){
    mousePosition.x = canvas.width / 2;
    mousePosition.y = canvas.height / 2;
  });

  createDots();
  requestAnimationFrame(animateDots);
};

window.onload = function(){
	CanvasParticle1();
}


var CanvasAutoResize = {
  draw: function() {
    var ctx = document.getElementById('canvas').getContext('2d');
    var canvasContainer = document.getElementById('canvas-container');
    ctx.canvas.width  = canvasContainer.offsetWidth-2;
    ctx.canvas.height = canvasContainer.offsetHeight-2;
  },

  initialize: function(){
    var self = CanvasAutoResize;
    self.draw();
    $(window).on('resize', function(event){
      self.draw();
    });
  }
}

$(function(argument) {
  CanvasAutoResize.initialize();
});
