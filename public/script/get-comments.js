// Funksjon for å hente og vise alle kommentarer
async function fetchComments() {
    const response = await fetch("/api/kommentar");
    const comments = await response.json();
    const commentList = document.getElementById("commentList");
    commentList.innerHTML = "";
    comments.forEach((comment) => {
        const li = document.createElement("li");
        li.textContent = `${comment.Tidspunkt} - Bruker ID ${comment.ID_bruker}: ${comment.Kommentar}`;
        commentList.appendChild(li);
    });
}

// Funksjon for å sende inn en ny kommentar
async function submitComment(event) {
    event.preventDefault();
    const Kommentar = document.getElementById("Kommentar").value;
    const response = await fetch("/api/kommentar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Kommentar }),
    });
    if (response.ok) {
        document.getElementById("Kommentar").value = "";
        fetchComments();
    } else {
        alert("Feil ved innsending av kommentar.");
    }
}

// Hent kommentarer ved lasting av siden og oppdater med jevne mellomrom
window.onload = () => {
    fetchComments();
    setInterval(fetchComments, 500);
};
