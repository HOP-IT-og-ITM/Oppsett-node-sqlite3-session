// Funksjon for å hente og vise alle kommentarer
async function fetchComments() {
    const response = await fetch("/api/kommentar");
    const comments = await response.json();
    const commentList = document.getElementById("commentList");
    commentList.innerHTML = "";
    comments.forEach((comment) => {
        //Lager div-strukturen for en kommentar
        const commentListItem = document.createElement("div");
        const commentListInformation = document.createElement("div");
        const commentListContent = document.createElement("div");
        commentListItem.appendChild(commentListInformation);
        commentListItem.appendChild(commentListContent);
        commentList.appendChild(commentListItem);
        //Gir div-elementene klassenavn:
        commentListItem.className = "comment";
        commentListInformation.className = "commentInfo";
        commentListContent.className = "commentContent";
        //Fyller inn innhold i kommentaren (tidspunkt + id_bruker og kommentar)
        commentListInformation.textContent = `${comment.Tidspunkt} - Bruker ID ${comment.ID_bruker}:`;
        commentListContent.textContent = `${comment.Kommentar}`;
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
    setInterval(fetchComments, 1000);
};
