console.log("Script loaded!");
const busData = [
  {
    routeNo: "101",
    from: "Vizianagaram",
    to: "Simhachalam",
    status: "Live",
    time: "06:30 AM",
    every: "15 min",
    fare: "₹25",
    color: "blue",
  },
  {
    routeNo: "700",
    from: "Smithahalem Hill Top",
    to: "Vizianagaram",
    status: "Live",
    time: "07:00 AM",
    every: "20 min",
    fare: "₹30",
    color: "green",
  },
  {
    routeNo: "222V",
    from: "Vizianagaram",
    to: "Visakhapatnam",
    status: "Active",
    time: "06:45 AM",
    every: "30 min",
    fare: "₹55",
    color: "orange",
  },
  {
    routeNo: "122",
    from: "Vizianagaram",
    to: "S. Kota",
    status: "Active",
    time: "06:50 AM",
    every: "25 min",
    fare: "₹28",
    color: "yellow",
  },
  {
    routeNo: "541",
    from: "Maddilapalem",
    to: "Kothavalasa",
    status: "Live",
    time: "06:20 AM",
    every: "18 min",
    fare: "₹40",
    color: "pink",
  },
  {
    routeNo: "6A",
    from: "RTC Complex",
    to: "Simhachalam Hills",
    status: "Live",
    time: "06:10 AM",
    every: "12 min",
    fare: "₹22",
    color: "teal",
  },
  {
    routeNo: "10A",
    from: "Airport",
    to: "RK Beach",
    status: "Active",
    time: "05:50 AM",
    every: "15 min",
    fare: "₹20",
    color: "red",
  },
];

const busList = document.getElementById("busList");

function renderBuses(data) {
  busList.innerHTML = "";
  data.forEach((bus) => {
    const card = document.createElement("div");
    card.className = `bus-card ${bus.color}`;
    card.innerHTML = `
      <div class="route">
        <h2>${bus.routeNo}</h2>
        <p>${bus.from} → ${bus.to}</p>
      </div>
      <div class="info">
        <span class="badge ${bus.status.toLowerCase()}">${bus.status}</span>
        <span>Time: ${bus.time}</span>
        <span>Every: ${bus.every}</span>
        <span>Fare: ${bus.fare}</span>
      </div>
    `;
    busList.appendChild(card);
  });
}

renderBuses(busData);

// Search filter
document.getElementById("searchInput").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  const filtered = busData.filter(
    (bus) =>
      bus.routeNo.toLowerCase().includes(value) ||
      bus.from.toLowerCase().includes(value) ||
      bus.to.toLowerCase().includes(value)
  );
  renderBuses(filtered);
});