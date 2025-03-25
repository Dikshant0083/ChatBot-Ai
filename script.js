let prompt = document.querySelector("#prompt")
let submitbtn = document.querySelector("#submit")
let chatContainer = document.querySelector(".chat-container")
let imagebtn = document.querySelector("#image")
let image = document.querySelector("#image img")
let imageinput = document.querySelector("#image input")
let dateElement = document.querySelector("#current-date")
let timeElement = document.querySelector("#current-time")
let themeToggle = document.querySelector("#theme-toggle")

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyB8brG9H3cDlQgKxYSh9w1Z3U7fVNof0hc"

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
}

// Theme Functionality
function initTheme() {
    // Get the saved theme from localStorage or default to 'dark'
    const savedTheme = localStorage.getItem('chat-theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    // Get current theme
    const currentTheme = document.body.getAttribute('data-theme');
    
    // Toggle between dark and light
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set the new theme on the body
    document.body.setAttribute('data-theme', newTheme);
    
    // Save the theme preference
    localStorage.setItem('chat-theme', newTheme);
}

// Date and Time Update
function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    
    dateElement.textContent = now.toLocaleDateString(undefined, dateOptions);
    timeElement.textContent = now.toLocaleTimeString(undefined, timeOptions);
}

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area")
    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [
                {
                    "parts": [
                        { text: user.message },
                        ...(user.file.data ? [{ inline_data: user.file }] : [])
                    ]
                }
            ]
        })
    }
    try {
        let response = await fetch(Api_Url, RequestOption)
        let data = await response.json()
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim()
        text.innerHTML = apiResponse
    }
    catch (error) {
        console.log(error);
        text.innerHTML = "Sorry, there was an error processing your request."
    }
    finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })
        image.src = `img.svg`
        image.classList.remove("choose")
        user.file = {}
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div")
    div.innerHTML = html
    div.classList.add(classes)
    return div
}

function handlechatResponse(userMessage) {
    user.message = userMessage
    let html = `<img src="user.png" alt="" id="userImage" width="8%">
<div class="user-chat-area">
${user.message}
${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
</div>`
    prompt.value = ""
    let userChatBox = createChatBox(html, "user-chat-box")
    chatContainer.appendChild(userChatBox)

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })

    setTimeout(() => {
        let html = `<img src="ai.png" alt="" id="aiImage" width="10%">
    <div class="ai-chat-area">
    <img src="loading.webp" alt="" class="load" width="50px">
    </div>`
        let aiChatBox = createChatBox(html, "ai-chat-box")
        chatContainer.appendChild(aiChatBox)
        generateResponse(aiChatBox)

    }, 600)
}

prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        handlechatResponse(prompt.value)
    }
})

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value)
})

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0]
    if (!file) return
    let reader = new FileReader()
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1]
        user.file = {
            mime_type: file.type,
            data: base64string
        }
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`
        image.classList.add("choose")
    }

    reader.readAsDataURL(file)
})

imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click()
})

// Theme Toggle Event
themeToggle.addEventListener("click", toggleTheme)

// Initial Setup
initTheme()
updateDateTime()

// Update time every second
setInterval(updateDateTime, 1000)