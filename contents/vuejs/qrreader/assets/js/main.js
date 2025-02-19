console.log("main.js!!");

const KEY_STORAGE  = "textcounter";

const MODE_LOADING = 0;
const MODE_MAIN    = 1;

const myData = {
	mode: MODE_LOADING,
	actives: [false, false, false, false, false],
	myOffcanvas: null,
	modalText: "",
	str: "***"
}

// Vue.js
const app = Vue.createApp({
	data(){
		return myData;
	},
	created(){
		console.log("created!!");
	},
	mounted(){
		console.log("mounted!!");
		// Offcanvas
		const elemOff = document.getElementById("myOffcanvas");
		this.myOffcanvas = new bootstrap.Offcanvas(elemOff);
		// Modal
		const elemModal = document.getElementById("myModal");
		const modal = new bootstrap.Modal(elemModal);
		setTimeout(()=>{
			this.changeMode(MODE_MAIN);
		}, 200);
	},
	methods:{
		changeMode(mode){
			if(this.mode == mode) return;
			this.mode = mode;
			for(let i=0; i<this.actives.length; i++){
				this.actives[i] = this.mode == i;
			}
		},
		onQRDetected(str){
			this.str = str;
		},
		onQRLost(str){
			this.str = str;
		},
		isValidURL(){
			const regex = new RegExp('^(https?:\\/\\/)?'+
				'(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}'+
				'(\\/[-a-z\\d%_.~+]*)*', 'i');
			return regex.test(this.str);
		},
		clickBtn(value){
			if(!this.isValidURL()) return;
			window.location.href = this.str;
		},
		showModal(){
			console.log("showModal");
			const elem = document.getElementById("myModal");
			if(elem.classList.contains("show")) return;
			elem.querySelector("#modalLabel").innerText = "Modal";
			bootstrap.Modal.getInstance(elem).show();
		},
		doAnimate(id, anim){
			console.log("doAnimate:", id, anim);
			const elem = document.getElementById(id);
			elem.setAttribute("class", "animate__animated " + anim);
			elem.addEventListener("animationend", ()=>{
				elem.removeEventListener("animationend", this);
				elem.removeAttribute("class");
			});
		}
	}
});

// Components(imobile)
app.component("imobile", {
	props: ["ad", "id"],
	created(){
		console.log("created");
	},
	mounted(){
		// Axios
		loadAxios("../../assets/imobile.json", json=>{
			const type = (this.isMobile())?"sp":"pc";
			const params = json[this.ad][type];
			this.loadBanner(params["pid"], params["mid"], params["asid"]);
		}, (err)=>{
			showToast("Error", "0 min ago", "通信エラーです");
		});
	},
	methods:{
		isMobile(){
			return navigator.userAgent.match(/iPhone|Android.+Mobile/);
		},
		loadBanner(pid, mid, asid){
			if(pid == "" || mid == "" || asid == "") return;
			console.log("loadBanner:", pid, mid, asid, this.id);
			// Banner
			(window.adsbyimobile=window.adsbyimobile||[]).push({
				pid: pid, mid: mid, asid: asid, 
				type: "banner", display: "inline", elementid: this.id});
			const elem = document.getElementById(this.id);
			const imobile = document.createElement("script");
			imobile.src = "//imp-adedge.i-mobile.co.jp/script/v1/spot.js?20220104";
			imobile.setAttribute("async", "true");
			elem.after(imobile);
		}
	},
	template: '<div class="overflow-hidden" v-bind:id="id"></div>'
});

// Compoonents(jsQR)
app.component("webcam", {
	data(){
		return {
			msg: "This is my Component!!",
			videoWidth: 480,
			videoHeight: 320,
			video: null,
			canvas: null,
			ctx: null
		}
	},
	mounted(){
		console.log("Component is mounted!!");
		this.init();// init
	},
	emits: ["on-qr-detected", "on-qr-lost"],// Important
	methods:{
		async init(){
			console.log("init");

			// WebCam
			navigator.mediaDevices = navigator.mediaDevices || (
				(navigator.mozGetUserMedia || navigator.webkitGetUserMedia)?{
					getUserMedia: function(c){
						return new Promise(function(y, n){
							(navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c, y, n);
						});
					}
				} : null);
			if(!navigator.mediaDevices){
				showToast("エラー", "Error", "Webカメラを取得できません");
				return;
			}

			// Mobile or PC
			const isMobile = (navigator.userAgent.match(/iPhone|Android.+Mobile/)) ? true:false;
			const optionMobile = {video: {facingMode: {exact: "environment"}}};
			const optionPC = {video: {width: this.videoWidth, height: this.videoHeight}};
			const option = (isMobile) ? optionMobile:optionPC;
			navigator.mediaDevices.getUserMedia(option).then(stream=>{
				this.video = document.createElement("video");
				this.video.srcObject = stream;
				this.video.onloadedmetadata = event=>{
					this.canvas = document.getElementsByTagName("canvas")[0];
					this.ctx = this.canvas.getContext("2d");
					this.video.play();// Play
					this.startTick();// Start
				};
			}).catch(err=>{
				console.log(err.name + ":" + err.message);
				showToast(err.name, "Error", err.message);
			});
		},
		startTick(){
			if(this.video.readyState === this.video.HAVE_ENOUGH_DATA){
				// Aspect
				this.canvas.style.aspectRatio = this.video.videoWidth / this.video.videoHeight;
				// Draw
				this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
				const img = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
				const code = jsQR(img.data, img.width, img.height, {inversionAttempts: "dontInvert"});
				if(code){
					this.drawRect(code.location);// Draw
					this.$emit("on-qr-detected", code.data);// Emit
				}else{
					this.$emit("on-qr-lost", "Lost...");// Emit
				}
			}
			setTimeout(this.startTick, 120);
		},
		drawRect(location){
			this.drawLine(location.topLeftCorner,     location.topRightCorner);
			this.drawLine(location.topRightCorner,    location.bottomRightCorner);
			this.drawLine(location.bottomRightCorner, location.bottomLeftCorner);
			this.drawLine(location.bottomLeftCorner,  location.topLeftCorner);
		},
		drawLine(begin, end){
			this.ctx.lineWidth = 2;
			this.ctx.strokeStyle = "#FF3B58";
			this.ctx.beginPath();
			this.ctx.moveTo(begin.x, begin.y);
			this.ctx.lineTo(end.x, end.y);
			this.ctx.stroke();
		}
	},
	template: '<div><canvas></canvas></div>'
});

app.mount("#app");