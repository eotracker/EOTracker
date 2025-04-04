function loadFullTable() {
    const tbody = document.getElementById("eo-body");
    const sortedEos = eos.slice().sort((a, b) => b.risk_level - a.risk_level);
    sortedEos.forEach(eo => {
        const impactFactors = `Pop: ${eo.impact_level === "High" ? ">1M" : eo.impact_level === "Medium" ? "100K-1M" : "<100K"}, Econ: ${eo.impact_level === "High" ? ">$10B" : eo.impact_level === "Medium" ? "$1B-$10B" : "<$1B"}, Long: ${eo.impact_level === "High" ? ">10 yrs" : eo.impact_level === "Medium" ? "2-10 yrs" : "<2 yrs"}`;
        let billStatus = eo.bill_status;
        if (billStatus.includes("HR") || billStatus.includes("S.")) {
            const parts = billStatus.split(", ");
            billStatus = `${parts[0]}, <b>${parts[1]}</b>`;
        }
        const billLink = eo.bill_link ? `<a href="${eo.bill_link}" target="_blank">${billStatus}</a>` : billStatus;
        const courtLink = eo.court_link ? `<a href="${eo.court_link}" target="_blank">${eo.court_challenges}</a>` : eo.court_challenges;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${eo.eo}</td>
            <td>${eo.title}</td>
            <td>${eo.summary}</td>
            <td>${billLink}</td>
            <td>${courtLink}</td>
            <td class="${eo.risk_level >= 8 ? 'red' : ''}" 
                onmouseover="showHover('risk', '${eo.eo}', '${eo.bill_status}', '${eo.court_challenges}', '${eo.impact_level}', event)" 
                onmouseout="hideHover()" 
                onclick="showPopup('risk', '${eo.eo}', '${eo.bill_status}', '${eo.court_challenges}', '${eo.impact_level}')">${eo.risk_level}</td>
            <td onmouseover="showHover('impact', '${eo.eo}', '${impactFactors}', '', '', event)" 
                onmouseout="hideHover()" 
                onclick="showPopup('impact', '${eo.eo}', '${impactFactors}')">${eo.impact_level}</td>
            <td>${eo.last_updated}</td>
        `;
        tbody.appendChild(row);
    });
}

function populateHighRisk() {
    const swipeContainer = document.getElementById("swipe-container");
    swipeContainer.innerHTML = '';
    const highRiskEOs = eos.filter(eo => eo.risk_level >= 8)
        .sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
    highRiskEOs.forEach(eo => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <strong>${eo.eo}: ${eo.title}</strong>
            <p>Risk: ${eo.risk_level} | Impact: ${eo.impact_level}</p>
            <p>Bill: ${eo.bill_status}</p>
            <p>Court: ${eo.court_challenges}</p>
            <p>Updated: ${eo.last_updated}</p>
        `;
        swipeContainer.appendChild(card);
    });
}

function updateHeaderDate() {
    const latestDate = eos.reduce((latest, eo) => {
        const eoDate = new Date(eo.last_updated);
        return eoDate > latest ? eoDate : latest;
    }, new Date(0));
    const formattedDate = latestDate.toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
    });
    document.getElementById("update-date").textContent = `Tracking Trump 2025 EOs—Updated as of ${formattedDate}`;
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
        container.style.display = "flex";
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
    const riskFilter = document.getElementById("risk-filter").value;
    const impactFilter = document.getElementById("impact-filter").value;
    const billFilter = document.getElementById("bill-filter").value;
    const courtFilter = document.getElementById("court-filter").value;
    
    const rows = document.querySelectorAll("#eo-table tbody tr");
    rows.forEach(row => {
        const riskLevel = parseInt(row.cells[5].textContent);
        const impactLevel = row.cells[6].textContent;
        const billStatus = row.cells[3].textContent.toLowerCase();
        const courtChallenges = row.cells[4].textContent.toLowerCase();

        let show = true;
        if (riskFilter === "red" && riskLevel < 8) show = false;
        if (riskFilter === "yellow" && (riskLevel < 5 || riskLevel > 7)) show = false;
        if (riskFilter === "green" && riskLevel > 4) show = false;
        if (impactFilter && impactLevel !== impactFilter) show = false;
        if (billFilter === "no bill yet" && billStatus !== "no bill yet") show = false;
        if (billFilter === "sponsored" && !billStatus.includes("hr") && !billStatus.includes("s.")) show = false;
        if (billFilter === "optional" && billStatus !== "optional—exec power") show = false;
        if (courtFilter === "lawsuit" && !courtChallenges.includes("lawsuit") && !courtChallenges.includes("suit")) show = false;
        if (courtFilter === "none" && (courtChallenges.includes("lawsuit") || courtChallenges.includes("suit"))) show = false;

        row.style.display = show ? "" : "none";
    });
}

function resetFilters() {
    document.getElementById("risk-filter").value = "";
    document.getElementById("impact-filter").value = "";
    document.getElementById("bill-filter").value = "";
    document.getElementById("court-filter").value = "";
    applyFilters();
}

document.addEventListener("DOMContentLoaded", () => {
    loadFullTable();
    populateHighRisk();
    applyFilters();
    updateHeaderDate();
});

document.getElementById("risk-filter").addEventListener("change", applyFilters);
document.getElementById("impact-filter").addEventListener("change", applyFilters);
document.getElementById("bill-filter").addEventListener("change", applyFilters);
document.getElementById("court-filter").addEventListener("change", applyFilters);
document.getElementById("reset-filters").addEventListener("click", resetFilters);