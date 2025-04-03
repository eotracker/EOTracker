function loadFullTable() {
    const tbody = document.getElementById("eo-body");
    const sortedEos = eos.slice().sort((a, b) => b.urgency - a.urgency);
    const billLinks = {
        "14155": "https://www.congress.gov/bill/119th-congress/house-bill/22"
    };
    const courtLinks = {
        "14148": "https://x.com/search?q=ACLU%20lawsuit%20EO%2014148",
        "14151": "https://x.com/search?q=unions%20lawsuit%20EO%2014151",
        "14155": "https://x.com/search?q=NAACP%20lawsuit%20EO%2014155",
        "14158": "https://x.com/search?q=California%20lawsuit%20EO%2014158",
        "14160": "https://x.com/search?q=ACLU%20lawsuit%20EO%2014160",
        "14162": "https://x.com/search?q=Tribal%20Nations%20lawsuit%20EO%2014162",
        "14164": "https://x.com/search?q=AARP%20lawsuit%20EO%2014164",
        "14165": "https://x.com/search?q=Planned%20Parenthood%20lawsuit%20EO%2014165"
    };
    sortedEos.forEach(eo => {
        const scaleFactors = `Pop: ${eo.impact === "High" ? ">1M" : eo.impact === "Medium" ? "100K-1M" : "<100K"}, Econ: ${eo.impact === "High" ? ">$10B" : eo.impact === "Medium" ? "$1B-$10B" : "<$1B"}, Long: ${eo.impact === "High" ? ">10 yrs" : eo.impact === "Medium" ? "2-10 yrs" : "<2 yrs"}`;
        let billStatus = eo.legislative;
        if (billStatus.includes("HR") || billStatus.includes("S.")) {
            const parts = billStatus.split(", ");
            billStatus = `${parts[0]}, <b>${parts[1]}</b>`;
        }
        const billLink = billLinks[eo.eo] ? `<a href="${billLinks[eo.eo]}" target="_blank">${billStatus}</a>` : billStatus;
        const courtLink = courtLinks[eo.eo] ? `<a href="${courtLinks[eo.eo]}" target="_blank">${eo.judicial}</a>` : eo.judicial;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${eo.eo}</td>
            <td>${eo.title}</td>
            <td>${eo.summary}</td>
            <td>${billLink}</td>
            <td>${courtLink}</td>
            <td class="${eo.urgency >= 8 ? 'red' : ''}" 
                onmouseover="showHover('risk', '${eo.eo}', '${eo.legislative}', '${eo.judicial}', '${eo.impact}', event)" 
                onmouseout="hideHover()" 
                onclick="showPopup('risk', '${eo.eo}', '${eo.legislative}', '${eo.judicial}', '${eo.impact}')">${eo.urgency}</td>
            <td onmouseover="showHover('scale', '${eo.eo}', '${scaleFactors}', '', '', event)" 
                onmouseout="hideHover()" 
                onclick="showPopup('scale', '${eo.eo}', '${scaleFactors}')">${eo.impact}</td>
            <td>${eo.last_updated}</td>
        `;
        tbody.appendChild(row);
    });
}

function loadStafferTable() {
    const container = document.getElementById("swipe-container");
    const redEos = eos.filter(eo => eo.urgency >= 8)
        .sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated))
        .slice(0, 10);
    redEos.forEach(eo => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <strong>${eo.eo}: ${eo.title}</strong><br>
            Risk: ${eo.urgency} | Impact Level: ${eo.impact}<br>
            Bill Status: ${eo.legislative}<br>
            Court Challenges: ${eo.judicial}<br>
            Updated: ${eo.last_updated}
        `;
        container.appendChild(card);
    });
}

function showPopup(type, eo, val1, val2, val3) {
    let popup = document.getElementById("popup");
    if (!popup) {
        popup = document.createElement("div");
        popup.id = "popup";
        document.body.appendChild(popup);
    }
    popup.innerHTML = type === "risk" ? `
        <strong>EO ${eo} Risk Factors</strong><br>
        Bill Status: ${val1}<br>
        Court Challenges: ${val2}<br>
        Impact Level: ${val3}<br>
        <button onclick="hidePopup()">Close</button>
    ` : `
        <strong>EO ${eo} Impact Factors</strong><br>
        ${val1}<br>
        <button onclick="hidePopup()">Close</button>
    `;
    popup.style.display = "block";
}

function hidePopup() {
    const popup = document.getElementById("popup");
    if (popup) popup.style.display = "none";
}

function showHover(type, eo, val1, val2, val3, event) {
    let hover = document.getElementById("hover");
    if (!hover) {
        hover = document.createElement("div");
        hover.id = "hover";
        document.body.appendChild(hover);
    }
    hover.innerHTML = type === "risk" ? `
        <strong>EO ${eo} Risk Factors</strong><br>
        Bill Status: ${val1}<br>
        Court Challenges: ${val2}<br>
        Impact Level: ${val3}
    ` : `
        <strong>EO ${eo} Impact Factors</strong><br>
        ${val1}
    `;
    hover.style.display = "block";
    hover.style.left = `${event.pageX + 10}px`;
    hover.style.top = `${event.pageY + 10}px`;
}

function hideHover() {
    const hover = document.getElementById("hover");
    if (hover) hover.style.display = "none";
}

function toggleHighRisk() {
    const container = document.getElementById("swipe-container");
    const button = document.getElementById("toggle-high-risk");
    if (container.style.display === "none") {
        container.style.display = "block";
        button.textContent = "Hide";
    } else {
        container.style.display = "none";
        button.textContent = "Show";
    }
}

let sortDirection = [1, 1, 1, 1, 1, -1, 1, 1];

function sortTable(col) {
    const tbody = document.getElementById("eo-body");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    
    rows.sort((a, b) => {
        if (col === 5) {
            const aVal = parseInt(a.cells[col].textContent);
            const bVal = parseInt(b.cells[col].textContent);
            return sortDirection[col] * (bVal - aVal);
        }
        if (col === 6) {
            const order = sortDirection[col] === 1 ? 
                { "High": 3, "Medium": 2, "Low": 1 } :
                { "High": 1, "Medium": 2, "Low": 3 };
            const aVal = order[a.cells[col].textContent];
            const bVal = order[b.cells[col].textContent];
            return bVal - aVal;
        }
        return sortDirection[col] * a.cells[col].textContent.localeCompare(b.cells[col].textContent);
    });
    
    sortDirection[col] = -sortDirection[col];
    const arrow = sortDirection[col] === 1 ? '▲<br>▼' : '▼<br>▲';
    document.querySelectorAll('th')[col].querySelector('.sort-arrow').innerHTML = arrow;
    rows.forEach(row => tbody.appendChild(row));
}

function applyFilters() {
    const urgencyFilter = document.getElementById("urgency-filter").value;
    const impactFilter = document.getElementById("impact-filter").value;
    const legislativeFilter = document.getElementById("legislative-filter").value;
    const judicialFilter = document.getElementById("judicial-filter").value;
    
    const rows = document.querySelectorAll("#eo-table tbody tr");
    rows.forEach(row => {
        const urgency = parseInt(row.cells[5].textContent);
        const impact = row.cells[6].textContent;
        const legislative = row.cells[3].textContent.toLowerCase();
        const judicial = row.cells[4].textContent.toLowerCase();

        let show = true;
        if (urgencyFilter === "red" && urgency < 8) show = false;
        if (urgencyFilter === "yellow" && (urgency < 5 || urgency > 7)) show = false;
        if (urgencyFilter === "green" && urgency > 4) show = false;
        if (impactFilter && impact !== impactFilter) show = false;
        if (legislativeFilter === "no bill yet" && legislative !== "no bill yet") show = false;
        if (legislativeFilter === "sponsored" && !legislative.includes("hr") && !legislative.includes("s.")) show = false;
        if (legislativeFilter === "optional" && legislative !== "optional—exec power") show = false;
        if (judicialFilter === "lawsuit" && !judicial.includes("lawsuit") && !judicial.includes("suit")) show = false;
        if (judicialFilter === "none" && (judicial.includes("lawsuit") || judicial.includes("suit"))) show = false;

        row.style.display = show ? "" : "none";
    });
}

function resetFilters() {
    document.getElementById("urgency-filter").value = "";
    document.getElementById("impact-filter").value = "";
    document.getElementById("legislative-filter").value = "";
    document.getElementById("judicial-filter").value = "";
    applyFilters();
}

document.addEventListener("DOMContentLoaded", () => {
    loadFullTable();
    loadStafferTable();
    applyFilters();
});

document.getElementById("urgency-filter").addEventListener("change", applyFilters);
document.getElementById("impact-filter").addEventListener("change", applyFilters);
document.getElementById("legislative-filter").addEventListener("change", applyFilters);
document.getElementById("judicial-filter").addEventListener("change", applyFilters);
document.getElementById("reset-filters").addEventListener("click", resetFilters);