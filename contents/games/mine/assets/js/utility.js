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
		fill("#0D6EFD");
		square(this._x, this._y, this._size, this._corner);
		image(this._img, this._xC, this._yC, this._sizeC, this._sizeC);
	}
}

//==========
// MineSweeper

class MineSweeper{

	constructor(rows, cols, mines){
		this._rows = rows;
		this._cols = cols;
		this._tblMine = [];
		this._tblSensor = [];
		this._tblSearch = [];
		this.initTrap(mines);
		this.initSensor();
		this.initSearch();
	}

	getMine(){return this._tblMine;}
	getSensor(){return this._tblSensor;}
	getSearch(){return this._tblSearch;}

	initTrap(mines){
		this._tblMine = [];
		for(let r=0; r<this._rows; r++){
			let line = [];
			for(let c=0; c<this._cols; c++){
				line.push(0);
			}
			this._tblMine.push(line);
		}
		let arr = [];
		let total = this._rows*this._cols;
		for(let b=0; b<total; b++){
			if(b < mines){
				arr.push(1);
			}else{
				arr.push(0);
			}
		}
		for(let b=total-1; 0<b; b--){
			let rdm = Math.floor(Math.random() * (b-1));
			let tmp = arr[rdm];
			arr[rdm] = arr[b];
			arr[b] = tmp;
		}
		for(let b=0; b<total; b++){
			let r = Math.floor(b / this._cols);
			let c = Math.floor(b % this._cols);
			this._tblMine[r][c] = arr[b];
		}
	}

	initSensor(){
		this._tblSensor = [];
		for(let r=0; r<this._rows; r++){
			let line = [];
			for(let c=0; c<this._cols; c++){
				line.push(0);
			}
			this._tblSensor.push(line);
		}
		for(let r=0; r<this._rows; r++){
			for(let c=0; c<this._cols; c++){
				if(this.checkTrap(r, c, -1, -1)) this._tblSensor[r][c]++;
				if(this.checkTrap(r, c, -1, 0))  this._tblSensor[r][c]++;
				if(this.checkTrap(r, c, -1, 1))  this._tblSensor[r][c]++;
				if(this.checkTrap(r, c, 0, -1))  this._tblSensor[r][c]++;
				if(this.checkTrap(r, c, 0, 1))   this._tblSensor[r][c]++;
				if(this.checkTrap(r, c, 1, -1))  this._tblSensor[r][c]++;
				if(this.checkTrap(r, c, 1, 0))   this._tblSensor[r][c]++;
				if(this.checkTrap(r, c, 1, 1))   this._tblSensor[r][c]++;
			}
		}
	}

	initSearch(){
		this._tblSearch = [];
		for(let r=0; r<this._rows; r++){
			let line = [];
			for(let c=0; c<this._cols; c++){
				line.push(0);
			}
			this._tblSearch.push(line);
		}
	}

	sweep(r, c){
		this.initSearch();
		if(this._tblMine[r][c] == 1) return true;
		this.recursive(r, c);
		return false;
	}

	recursive(r, c){
		if(this._tblSearch[r][c] == 1) return;
		this._tblSearch[r][c] = 1;
		if(this._tblSensor[r][c] != 0) return;
		if(this.checkSpace(r, c, 1, 0))  this.recursive(r+1, c);
		if(this.checkSpace(r, c, -1, 0)) this.recursive(r-1, c);
		if(this.checkSpace(r, c, 0, 1))  this.recursive(r, c+1);
		if(this.checkSpace(r, c, 0, -1)) this.recursive(r, c-1);
	}

	checkSpace(r, c, x, y){
		let cR = r + x;
		let cC = c + y;
		if(cR < 0) return false;
		if(cC < 0) return false;
		if(this._rows <= cR) return false;
		if(this._cols <= cC) return false;
		if(this._tblMine[cR][cC] == 1) return false;
		return true;
	}

	checkTrap(r, c, x, y){
		let cR = r + x;
		let cC = c + y;
		if(cR < 0) return false;
		if(cC < 0) return false;
		if(this._rows <= cR) return false;
		if(this._cols <= cC) return false;
		if(this._tblMine[r][c] == 1) return false;
		if(this._tblMine[cR][cC] == 0) return false;
		return true;
	}

	consoleAll(){
		console.log("=Mine=");
		this.consoleTable(this._tblMine);
		console.log("=Sensor=");
		this.consoleTable(this._tblSensor);
		console.log("=Search=");
		this.consoleTable(this._tblSearch);
	}

	consoleTable(table){
		let line = "";
		for(let c=0; c<this._cols*2; c++) line += "-";
		line += "-\n";
		for(let r=0; r<this._rows; r++){
			line += "|";
			for(let c=0; c<this._cols; c++){
				let n = table[r][c];
				line += n;
				if(c < this._cols-1) line += ",";
			}
			line += "|\n";
		}
		for(let c=0; c<this._cols*2; c++) line += "-";
		line += "-\n";
		console.log(line);
	}
}