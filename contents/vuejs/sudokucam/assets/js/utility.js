console.log("utility.js!!");

//==========
// ServiceWorker
navigator.serviceWorker.register("./pwa_sw.js");

//==========
// Toast
function showToast(title, sub, msg, autohide=true, delay=400){
	// Object
	if(typeof(msg) == "object"){
		const props = Object.getOwnPropertyNames(msg);
		for(let prop of props){
			setTimeout(()=>popToast(title, sub, msg[prop], autohide), delay);
			delay += delay;
		}
		return;
	}
	setTimeout(()=>popToast(title, sub, msg, autohide), delay);
}

function popToast(title, sub, msg, autohide=true){
	if(typeof(msg) == "object") return;
	if(100 < msg.length) return;
	// Clone
	const base = document.querySelector(".toast");
	const clone = base.cloneNode(true);
	clone.querySelector("strong").innerText = title;
	clone.querySelector("small").innerText = sub;
	clone.querySelector(".toast-body").innerText = msg;
	// Event
	clone.addEventListener("shown.bs.toast", ()=>{
		//console.log("shown");
	});
	clone.addEventListener("hidden.bs.toast", ()=>{
		//console.log("hidden");
		clone.remove();// Remove
	});
	clone.classList.remove("d-none");
	// Append
	const container = document.querySelector(".toast-container");
	container.appendChild(clone);
	// Toast
	const toast = new bootstrap.Toast(clone, {autohide: autohide});
	toast.show();
}

//==========
// Axios
function loadAxios(url, onSuccess, onError){
	const option = {responseType: "blob"};
	axios.get(url, option).then(res=>{
		res.data.text().then(str=>{
			onSuccess(JSON.parse(str));
		});
	}).catch(err=>{
		onError(err);
	});
}

//==========
// Notification
function sendNotification(title, body, timeout=12000){
	console.log("sendNotification:", title);
	if(!Push.Permission.has()){
		Push.Permission.request(()=>{
			console.log("onGranted!!");
			const status = Push.Permission.get();// Status
			console.log(status);
			createNotification(title, body, timeout);
		}, ()=>{
			console.log("onDenied!!");
			const status = Push.Permission.get();// Status
			console.log(status);
		});
		return;
	}
	createNotification(title, body, timeout);
}

function createNotification(title, body, timeout=12000){

	Push.create(title, {
		body: body,
		icon: "./assets/images/logo.png",
		tag: "myTag",
		timeout: timeout,
		vibrate: [100, 100, 100],
		onClick: function(e){
			console.log("onClick", e);
		},
		onShow: function(e){
			console.log("onShow", e);
		},
		onClose: function(e){
			console.log("onClose", e);
		},
		onError: function(e){
			console.log("onError", e);
		}
	});
}

//==========
// Sudoku
const SD_SIZE = 9;// Sudoku_9x9
const SD_MAX  = SD_SIZE * SD_SIZE;

function scanImg(cvs, letters){
	const ctx = cvs.getContext("2d");// Context
	// Table(9x9)
	const table = new Array(SD_MAX).fill(0);
	const gSize = cvs.width / SD_SIZE;
	// Scan
	for(let letter of letters){
		if(letter.matches.length<=0) continue;
		const n = letter.matches[0].letter;
		if(n == "" | n == " " | n == "\t") continue;
		const x = letter.x;
		const y = letter.y;
		const w = letter.width;
		const h = letter.height;
		const cX = x + w/2;
		const cY = y + h/2;
		const r = Math.floor(cY / gSize);
		const c = Math.floor(cX / gSize);
		const i = r * SD_SIZE + c;
		table[i] = parseInt(n);
		ctx.fillStyle = "orange";
		ctx.fillRect(x, y, w, h);
	}
	if(letters.length <= 0) return;
	console.log(table, letters);
	//solveSudoku(cvs, table, 0);// Solve
}
