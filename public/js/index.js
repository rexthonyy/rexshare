window.onload = () => {

	let numConnections1 = document.getElementById("numConnections1");
	let numConnections2 = document.getElementById("numConnections2");
	document.getElementById("roomName1").textContent = ROOM_NAME;
	document.getElementById("roomName2").textContent = ROOM_NAME;
	let inputField1 = document.getElementById("inputFieldLightMode");
	let inputField2 = document.getElementById("inputFieldDarkMode");
	let copyBtn1 = document.getElementById("copyBtn1");
	let copyBtn2 = document.getElementById("copyBtn2");
	let copyBtn1Content = document.getElementById("copyBtn1Content");
	let copyBtn2Content = document.getElementById("copyBtn2Content");

	let text = "";

	function establishSocketConnection(){
		let socketUrl =  "wss://rexshare.herokuapp.com/"; 
		//let socketUrl = "ws://127.0.0.1:3000";
		let socket = new WebSocket(socketUrl);
		
		let isSocketConnected = false;
		let isLastClientToInputData = false;
		
		socket.onopen = e => {
			isSocketConnected = true;
			// console.log("WebSocket connection established");
			let inputValue = {
				roomName: ROOM_NAME,
				type: 'connection'
			};
			socket.send(JSON.stringify(inputValue));
		};
		
		socket.onclose = e => {
			// console.log("Websocket is closed");
			establishSocketConnection();
		};
		
		socket.onerror = e => {
			// console.log("WebSocket error");
		};
		
		socket.onmessage = e => {
			let response = JSON.parse(e.data);
			if(response.type == 'msg'){	
				isLastClientToInputData = false;
				inputField1.value = response.msg;
				inputField2.value = response.msg;
				text = response.msg;
			}else{
				if(response.numUsers == 1){
					numConnections1.textContent = "1 client";
					numConnections2.textContent = "1 client";
				}else{
					numConnections1.textContent = response.numUsers + " clients";
					numConnections2.textContent = response.numUsers + " clients";
				}
				
				if(isLastClientToInputData){
					shareInput();
				}
			}
		};
		
		inputField1.oninput = () => {
			text = inputField1.value;
			shareInput();
		};

		inputField2.oninput = () => {
			text = inputField2.value;
			shareInput();
		};

		copyBtn1.onclick = () => {
			copyToClipboard(inputField1.value);
			inputField1.select();
			inputField1.setSelectionRange(0, text.length);
			showTempText(copyBtn1Content, "Copied!", "Copy to clipboard", 3000);
		};

		copyBtn2.onclick = () => {
			copyToClipboard(inputField2.value);
			inputField2.select();
			inputField2.setSelectionRange(0, text.length);
			showTempText(copyBtn2Content, "Copied!", "Copy to clipboard", 3000);
		};
		
		function shareInput(){
			if(isSocketConnected){
				isLastClientToInputData = true;
				let inputValue = {
					type: 'message',
					roomName: ROOM_NAME,
					text: text
				};
				socket.send(JSON.stringify(inputValue));
			}else{
				console.log("Socket is not yet connected");
				alert("Socket not connected");
			}
		}
		
		function copyToClipboard(text){
			var dummy = document.createElement("textarea");
			document.body.appendChild(dummy);
			dummy.value = text;
			dummy.select();
			document.execCommand("copy");
			document.body.removeChild(dummy);
		}

		function showTempText(elm, tempText, normalText, duration){
			elm.textContent = tempText;
			setTimeout(() => {
				elm.textContent = normalText;
			}, duration);
		}

		setSwitchListener();
		setEditorTabPressListener();
		setupMode();

		function setSwitchListener(){
			let customToggleLightSwitch = document.getElementById("customToggleLightSwitch");
			customToggleLightSwitch.onclick = () => {
				if(customToggleLightSwitch.checked){
					customToggleLightSwitch.checked = false;
					//save setting as a cookie
					setCookie("mode", "dark", 7);
					enableDarkMode();
					inputField2.value = text;
				}
			};

			let customToggleDarkSwitch = document.getElementById("customToggleDarkSwitch");
			customToggleDarkSwitch.onclick = () => {
				if(!customToggleDarkSwitch.checked){
					customToggleDarkSwitch.checked = true;
					//save setting as a cookie
					setCookie("mode", "light", 7);
					enableLightMode();
					inputField1.value = text;
				}
			};
		}

		function setEditorTabPressListener(){
			let inputFieldLightMode = document.getElementById("inputFieldLightMode");
			inputFieldLightMode.onkeydown = function(e){
				if(e.keycode == 9 || e.which == 9){
					e.preventDefault();
					let s = this.selectionStart;
					this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
					this.selectionEnd = s + 1;
				}
			};

			let inputFieldDarkMode = document.getElementById("inputFieldDarkMode");
			inputFieldDarkMode.onkeydown = function(e){
				if(e.keycode == 9 || e.which == 9){
					e.preventDefault();
					let s = this.selectionStart;
					this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
					this.selectionEnd = s + 1;
				}
			};
		}

		function setupMode(){
			let mode = getCookie("mode");
			if(mode == ""){
				enableLightMode();
			}else{
				mode == "light" ? enableLightMode() : enableDarkMode();
			}
		}

		function enableLightMode(){
			let lightModeContainer = document.getElementsByClassName("custom-lm-container")[0];
			let darkModeContainer = document.getElementsByClassName("custom-dm-container")[0];

			lightModeContainer.style.display = "block";
			darkModeContainer.style.display = "none";
		}

		function enableDarkMode(){
			let lightModeContainer = document.getElementsByClassName("custom-lm-container")[0];
			let darkModeContainer = document.getElementsByClassName("custom-dm-container")[0];

			lightModeContainer.style.display = "none";
			darkModeContainer.style.display = "block";
		}
	}

	establishSocketConnection();
};