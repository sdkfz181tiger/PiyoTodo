console.log("utility.js!!");

//==========
// ServiceWorker
navigator.serviceWorker.register("./pwa_sw.js");

//==========
// MyButton

class MyButton{

	constructor(file, onPressed=null){
		this._img = loadImage("./assets/images/" + file);
		this._onPressed = onPressed;
		this.setPos(24, 24);// Default
	}

	setPos(x, y, size=32){
		this._size = size;
		this._x = x - this._size*0.5;
		this._y = y - this._size*0.5;
		this._corner = this._size * 0.1;
		this._sizeC = this._size * 0.6;
		this._xC = this._x + this._size*0.5 - this._sizeC*0.5;
		this._yC = this._y + this._size*0.5 - this._sizeC*0.5;
	}

	checkBtn(){
		if(mouseX < this._x) return;
		if(mouseY < this._y) return;
		if(this._x + this._size < mouseX) return;
		if(this._y + this._size < mouseY) return;
		if(this._onPressed) this._onPressed();
	}

	drawBtn(){
		fill("dodgerblue");
		square(this._x, this._y, this._size, this._corner);
		image(this._img, this._xC, this._yC, this._sizeC, this._sizeC);
	}
}

//==========
// Flick

class FlickManager{

	constructor(thre, onFlicked){
		this._thre = thre**2;
		this._onFlicked = onFlicked;
		this._touchFlg = false;
		this._fX = 0;
		this._fY = 0;
	}

	touchStarted(){
		//console.log("touchStarted");
		if(this._touchFlg) return;
		this._touchFlg = true;
		this._fX = mouseX;
		this._fY = mouseY;
	}

	touchMoved(){
		//console.log("touchMoved");
		if(!this._touchFlg) return;

		const dist = (this._fX-mouseX)**2 + (this._fY-mouseY)**2;
		if(this._thre < dist){
			const rad = Math.atan2(mouseY-this._fY, mouseX-this._fX);
			const deg = (Math.floor(rad*180/Math.PI)+360) % 360;
			//console.log(deg, mouseY-this._fY, mouseX-this._fX);
			if(deg < 45){
				//console.log(deg, dist, "right");
				this._onFlicked({dir:"right", fX:this._fX, fY:this._fY});
			}else if(deg < 135){
				//console.log(deg, dist, "down");
				this._onFlicked({dir:"down", fX:this._fX, fY:this._fY});
			}else if(deg < 225){
				//console.log(deg, dist, "left");
				this._onFlicked({dir:"left", fX:this._fX, fY:this._fY});
			}else if(deg < 315){
				//console.log(deg, dist, "up");
				this._onFlicked({dir:"up", fX:this._fX, fY:this._fY});
			}else{
				//console.log(deg, dist, "right");
				this._onFlicked({dir:"right", fX:this._fX, fY:this._fY});
			}
		}
		this._fX = mouseX;
		this._fY = mouseY;
	}

	touchEnded(){
		//console.log("touchEnded");
		this._touchFlg = false;
		this._fX = mouseX;
		this._fY = mouseY;
	}
}

//==========
// 2048

class Smz2048{

	constructor(){
		this._size = 4;
		this._board = [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		];
		this._copy = [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		];
		this._moves = [];
		this._history = [];
		this.copyBoard();
	}

	slideLeft(){
		this._moves = [];
		this.copyBoard();
		for(let r=0; r<this._size; r++){
			this.slideCells(r, 0, 0, 1);
		}
		return this.isChanged();
	}

	slideRight(){
		this._moves = [];
		this.copyBoard();
		for(let r=0; r<this._size; r++){
			this.slideCells(r, this._size-1, 0, -1);
		}
		return this.isChanged();
	}

	slideUp(){
		this._moves = [];
		this.copyBoard();
		for(let c=0; c<this._size; c++){
			this.slideCells(0, c, 1, 0);
		}
		return this.isChanged();
	}

	slideDown(){
		this._moves = [];
		this.copyBoard();
		for(let c=0; c<this._size; c++){
			this.slideCells(this._size-1, c, -1, 0);
		}
		return this.isChanged();
	}

	getSize(){return this._size;}

	getBoard(){return this._board;}

	getScore(){
		let size = this._size;
		let score = 0;
		for(let r=0; r<size; r++){
			for(let c=0; c<size; c++){
				score += this._board[r][c];
			}
		}
		return score;
	}

	getMove(r, c){
		for(let i=0; i<this._moves.length; i++){
			let move = this._moves[i];
			if(move.tR == r && move.tC == c) return move;
		}
		return null;
	}

	slideCells(r, c, dR, dC){
		if(dR == 0 && dC == 0) return;
		if(!this.isInside(r)) return;
		if(!this.isInside(c)) return;
		if(!this.isInside(r+dR)) return;
		if(!this.isInside(c+dC)) return;
		//console.log("=> slideCells[", r, c, "]");
		if(this.browCells(r, c, dR, dC)){
			this.slideCells(r, c, dR, dC);
		}else{
			this.slideCells(r+dR, c+dC, dR, dC);
		}
	}

	browCells(r, c, dR, dC){
		let tR = r + dR;
		let tC = c + dC;
		while(this.isInside(tR) && this.isInside(tC)){
			if(this._board[r][c] == 0){
				if(this._board[tR][tC] != 0){
					//console.log("swap[", tR, tC, "]->[", r, c, "]");
					this.swapCells(tR, tC, r, c);
					this._moves.push({gR:r-tR, gC:c-tC, tR:tR, tC:tC});
					return true;
				}
			}else{
				if(this._board[r][c] == this._board[tR][tC]){
					//console.log("combine[", tR, tC, "]->[", r, c, "]");
					this.combineCells(tR, tC, r, c);
					this._moves.push({gR:r-tR, gC:c-tC, tR:tR, tC:tC});
					return false;
				}
				if(this._board[tR][tC] != 0){
					//console.log("pass[", tR, tC, "]->[", r, c, "]");
					return false;
				}
			}
			tR += dR;
			tC += dC;
		}
		return false;
	}

	combineCells(fromR, fromC, toR, toC){
		this._board[toR][toC] += this._board[fromR][fromC];
		this._board[fromR][fromC] = 0;
	}

	swapCells(fromR, fromC, toR, toC){
		let tmp = this._board[toR][toC];
		this._board[toR][toC] = this._board[fromR][fromC];
		this._board[fromR][fromC] = tmp;
	}

	isInside(n){
		if(n < 0) return false;
		if(this._size <= n) return false;
		return true;
	}

	isChanged(){
		let size = this._size;
		for(let r=0; r<size; r++){
			for(let c=0; c<size; c++){
				if(this._board[r][c] != this._copy[r][c]) return true;
			}
		}
		return false;
	}

	copyBoard(){
		let size = this._size;
		for(let r=0; r<size; r++){
			for(let c=0; c<size; c++){
				this._copy[r][c] = this._board[r][c];
			}
		}
	}

	randomPut(n = 2){
		let size = this._size;
		let arr = [];
		for(let r=0; r<size; r++){
			for(let c=0; c<size; c++){
				if(this._board[r][c] == 0) arr.push({r:r, c:c});
			}
		}
		if(arr.length <= 0) return false;
		let i = Math.floor(Math.random() * arr.length);
		let r = arr[i].r;
		let c = arr[i].c;
		this._last = {r:r, c:c};
		this._board[r][c] = n;
		return true;
	}

	checkGameOver(){
		let size = this._size;
		for(let r=0; r<size; r++){
			for(let c=0; c<size; c++){
				if(this._board[r][c] == 0) return false;
				if(r < size-1){
					if(this._board[r][c] == this._board[r+1][c]){
						return false;
					}
				}
				if(c < size-1){
					if(this._board[r][c] == this._board[r][c+1]){
						return false;
					}
				}
			}
		}
		return true;
	}

	pushHistory(){
		let arr = [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		];
		let size = this._size;
		for(let r=0; r<size; r++){
			for(let c=0; c<size; c++){
				arr[r][c] = this._board[r][c];
			}
		}
		this._history.push(arr);
	}

	popHistory(){
		if(this._history.length < 2) return;
		this._history.pop();
		let arr = this._history.pop();
		let size = this._size;
		for(let r=0; r<size; r++){
			for(let c=0; c<size; c++){
				this._board[r][c] = arr[r][c];
			}
		}
		this.pushHistory();
		this.consoleBoard();
	}

	consoleBoard(){
		let size = this._size;
		let line = "SCORE:" + this.getScore();
		while(line.length < 17){
			line = line + "-";
			if(line.length < 17) line = "-" + line;
		}
		line += "\n";
		for(let r=0; r<size; r++){
			line += "|";
			for(let c=0; c<size; c++){
				let n = this._board[r][c];
				if(n < 10){
					line += "  " + n;
				}else if(n < 100){
					line += " " + n;
				}else{
					line += n;
				}
				if(c < size-1) line += ",";
			}
			line += "|\n";
		}
		line += "-----------------";
		console.log(line);
	}
}