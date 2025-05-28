
document.addEventListener("DOMContentLoaded", () => {
    const trackBtn = document.getElementById("track-deck");
    const drawBtn   = document.getElementById("dc-btn");
    const resetBtn  = document.getElementById("reset-draw");
    const cardInput = document.getElementById("deck-name");
    const resultEl  = document.getElementById("probability-result");
    const drawnImg  = document.getElementById("dc-card");
  
    //Kans berekenen voor een specifieke kaart
    trackBtn.addEventListener("click", async e => {
      e.preventDefault();
      const deckName = document.querySelector(".selected").textContent.trim();
      const cardName = cardInput.value.trim();
      if (!deckName || !cardName) return;
  
      try {
        const res = await fetch("/drawcard/probability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deckName, cardName })
        });
        const data = await res.json();
        if (data.error) {
          resultEl.textContent = data.error;
        } else {
          resultEl.textContent =
            `Kans op '${cardName}' in '${deckName}': ${data.probability}% ` +
            `(${data.matchCount}/${data.total})`;
        }
      } catch (err) {
        console.error("Fetch error:", err);
        resultEl.textContent = "Er is iets misgegaan bij de berekening.";
      }
    });
  
    //Willekeurige kaart trekken zonder vervanging
    drawBtn.addEventListener("click", async e => {
      e.preventDefault();
      const deckName = document.querySelector(".selected").textContent.trim();
      if (!deckName) return;
  
      try {
        const res = await fetch("/drawcard/random", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deckName })
        });
        const data = await res.json();
        if (data.error) {
          resultEl.textContent = data.error;
        } else if (data.image) {
          drawnImg.src = data.image;
          drawnImg.style.display = "inline-block";
        }
      } catch (err) {
        console.error("Fetch error:", err);
        resultEl.textContent = "Er is iets misgegaan bij het trekken.";
      }
    });
  
    //Reset draw (wissen van alle getrokken kaarten in deze sessie voor dit deck)
    resetBtn.addEventListener("click", async e => {
      e.preventDefault();
      const deckName = document.querySelector(".selected").textContent.trim();
      if (!deckName) return;
  
      try {
        await fetch("/drawcard/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deckName })
        });
        //UI reset
        resultEl.textContent = "";
        drawnImg.style.display = "none";
      } catch (err) {
        console.error("Fetch error:", err);
        resultEl.textContent = "Er is iets misgegaan bij het resetten.";
      }
    });
  });
  