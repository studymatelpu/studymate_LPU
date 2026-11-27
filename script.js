// all data is saved in localStorage of the browser

var users = JSON.parse(localStorage.getItem("users"));

// some demo students so the list is not empty
if (users == null) {
    users = [
        {name: "Aman (demo)", regno: "11111111", password: "1234", course: "B.Tech CSE", subject: "Python", time: "Evening", place: "Library", style: "Discussion", blocked: []},
        {name: "Priya (demo)", regno: "22222222", password: "1234", course: "BCA", subject: "Maths", time: "Morning", place: "Uni Mall", style: "Solving questions", blocked: []},
        {name: "Rahul (demo)", regno: "33333333", password: "1234", course: "MCA", subject: "DSA", time: "Night", place: "Online", style: "Quiet study", blocked: []}
    ];
    saveUsers();
}

function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

function getValue(id) {
    return document.getElementById(id).value;
}

function findUser(regno) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].regno == regno) {
            return users[i];
        }
    }
    return null;
}

function getMe() {
    return findUser(localStorage.getItem("loggedIn"));
}

function register() {
    var name = getValue("name");
    var regno = getValue("rregno");
    var password = getValue("rpassword");

    if (name == "" || password == "") {
        alert("Please fill all boxes");
        return;
    }
    if (regno.length != 8 || isNaN(regno)) {
        alert("Registration number must be 8 digits");
        return;
    }
    if (password != getValue("password2")) {
        alert("Passwords do not match");
        return;
    }
    if (findUser(regno) != null) {
        alert("Already registered");
        return;
    }

    users.push({
        name: name,
        regno: regno,
        password: password,
        course: getValue("rcourse"),
        subject: getValue("rsubject"),
        time: getValue("rtime"),
        place: getValue("rplace"),
        style: getValue("rstyle"),
        blocked: []
    });
    saveUsers();
    alert("Registered! Now login");
    showPage("loginPage");
}

function login() {
    var user = findUser(getValue("regno"));

    if (user == null || user.password != getValue("password")) {
        alert("Wrong registration number or password");
        return;
    }
    localStorage.setItem("loggedIn", user.regno);
    showPage("homePage");
}

function logout() {
    localStorage.removeItem("loggedIn");
    showPage("loginPage");
}

function saveChoices() {
    var me = getMe();
    me.course = getValue("course");
    me.subject = getValue("subject");
    me.time = getValue("time");
    me.place = getValue("place");
    me.style = getValue("style");
    saveUsers();
    showHome();
}

// 1 point for each same thing
function getScore(a, b) {
    var score = 0;
    if (a.subject == b.subject) score++;
    if (a.time == b.time) score++;
    if (a.place == b.place) score++;
    if (a.style == b.style) score++;
    return score;
}

// names are typed by users so do not let them become HTML
function safe(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function showHome() {
    var me = getMe();
    if (me == null) {
        showPage("loginPage");
        return;
    }

    document.getElementById("welcome").textContent = "Welcome " + me.name;
    document.getElementById("course").value = me.course;
    document.getElementById("subject").value = me.subject;
    document.getElementById("time").value = me.time;
    document.getElementById("place").value = me.place;
    document.getElementById("style").value = me.style;

    var list = "";
    var blockedList = "";

    // show best matches first (4 points to 1 point)
    for (var s = 4; s >= 1; s--) {
        for (var i = 0; i < users.length; i++) {
            var u = users[i];
            if (u.regno == me.regno || getScore(me, u) != s) continue;
            if (me.blocked.includes(u.regno) || u.blocked.includes(me.regno)) continue;

            list += "<div class='card'>";
            list += "<h3>" + safe(u.name) + "</h3>";
            list += "<p>" + u.course + "</p>";
            list += "<p>" + u.subject + " | " + u.time + " | " + u.place + " | " + u.style + "</p>";
            list += "<p><b>Match: " + s + " out of 4</b></p>";
            list += "<button onclick=\"openChat('" + u.regno + "')\">Chat</button>";
            list += "<button onclick=\"blockUser('" + u.regno + "')\">Block</button>";
            list += "</div>";
        }
    }

    for (var j = 0; j < me.blocked.length; j++) {
        var b = findUser(me.blocked[j]);
        blockedList += "<p>" + safe(b.name) + " ";
        blockedList += "<button onclick=\"unblockUser('" + b.regno + "')\">Unblock</button></p>";
    }

    // people you already have messages with
    var chatList = "";
    for (var k = 0; k < users.length; k++) {
        var c = users[k];
        if (me.blocked.includes(c.regno) || c.blocked.includes(me.regno)) continue;
        var key = "chat" + [me.regno, c.regno].sort().join("-");
        if (localStorage.getItem(key) != null) {
            chatList += "<p>" + safe(c.name) + " <button onclick=\"openChat('" + c.regno + "')\">Open Chat</button></p>";
        }
    }
    document.getElementById("chats").innerHTML = chatList || "<p>No chats yet. Press Chat on a partner.</p>";

    document.getElementById("list").innerHTML = list || "<p>No partner found. Try changing your choices.</p>";
    document.getElementById("blocked").innerHTML = blockedList || "<p>Nobody</p>";
}

function blockUser(regno) {
    if (confirm("Block this person?")) {
        getMe().blocked.push(regno);
        saveUsers();
        showHome();
    }
}

function unblockUser(regno) {
    var me = getMe();
    me.blocked.splice(me.blocked.indexOf(regno), 1);
    saveUsers();
    showHome();
}

function openChat(regno) {
    localStorage.setItem("chatWith", regno);
    showPage("chatPage");
}

// same key for both people in the chat
function chatKey() {
    var two = [localStorage.getItem("loggedIn"), localStorage.getItem("chatWith")];
    return "chat" + two.sort().join("-");
}

function showChat() {
    var me = getMe();
    var other = findUser(localStorage.getItem("chatWith"));
    if (me == null || other == null || me.blocked.includes(other.regno) || other.blocked.includes(me.regno)) {
        showPage("homePage");
        return;
    }

    document.getElementById("chatName").textContent = other.name;

    var messages = JSON.parse(localStorage.getItem(chatKey())) || [];
    var box = document.getElementById("messages");
    box.innerHTML = "";
    for (var i = 0; i < messages.length; i++) {
        var p = document.createElement("p");
        p.textContent = messages[i].text;

        // my messages on right side, other person on left side
        if (messages[i].from == me.regno) {
            p.className = "myMsg";
        } else {
            p.className = "otherMsg";
        }

        box.appendChild(p);
    }
    box.scrollTop = box.scrollHeight; // go to last message
}

function sendMessage() {
    var text = getValue("msg");
    if (text == "") return;

    var messages = JSON.parse(localStorage.getItem(chatKey())) || [];
    messages.push({from: localStorage.getItem("loggedIn"), text: text});
    localStorage.setItem(chatKey(), JSON.stringify(messages));

    document.getElementById("msg").value = "";
    showChat();
}

// demo account to try all the features without register
function demoLogin() {
    var demo = findUser("99999999");
    if (demo == null) {
        demo = {name: "Demo User", regno: "99999999", password: "demo", course: "B.Tech CSE", subject: "Python", time: "Evening", place: "Library", style: "Discussion", blocked: ["33333333"]};
        users.push(demo);
        saveUsers();

        // one sample message from Aman
        var messages = [{from: "11111111", text: "Hi! Want to study Python in the library?"}];
        localStorage.setItem("chat11111111-99999999", JSON.stringify(messages));
    }
    localStorage.setItem("loggedIn", demo.regno);
    showPage("homePage");
}

// show only one page and hide the others
function showPage(id) {
    var pages = document.getElementsByClassName("page");
    for (var i = 0; i < pages.length; i++) {
        pages[i].style.display = "none";
    }
    document.getElementById(id).style.display = "block";

    // empty the typing boxes
    var boxes = document.getElementsByTagName("input");
    for (var j = 0; j < boxes.length; j++) {
        boxes[j].value = "";
    }

    if (id == "homePage") showHome();
    if (id == "chatPage") showChat();
}

// if already logged in then open home page
if (getMe() != null) {
    showPage("homePage");
}
