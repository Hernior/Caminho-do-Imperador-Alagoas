const cities = [
  {
    name: "Piaçabuçu",
    lat: -10.407753,
    lng: -36.435382,
    elevation: 0,
    verifiedPlaque: true,
    description: "Ponto verificado da placa física do Caminho do Imperador em Piaçabuçu."
  },
  {
    name: "Penedo",
    lat: -10.290822,
    lng: -36.586380,
    elevation: 7,
    verifiedPlaque: true,
    description: "Ponto verificado da placa física do Caminho do Imperador em Penedo."
  },
  {
    name: "Porto Real do Colégio",
    lat: -10.188428,
    lng: -36.839223,
    elevation: 6,
    verifiedPlaque: true,
    description: "Ponto verificado da placa física do Caminho do Imperador em Porto Real do Colégio."
  },
  {
    name: "São Brás",
    lat: -10.1141,
    lng: -36.8522,
    elevation: null,
    verifiedPlaque: false,
    description: "Município da rota. Coordenada atual representa a sede municipal; ponto exato da placa ainda não confirmado."
  },
  {
    name: "Traipu",
    lat: -9.971902,
    lng: -37.001545,
    elevation: 8,
    verifiedPlaque: true,
    description: "Ponto verificado da placa física do Caminho do Imperador em Traipu."
  },
  {
    name: "Belo Monte",
    lat: -9.8227,
    lng: -37.2770,
    elevation: null,
    verifiedPlaque: false,
    description: "Município da rota. Coordenada atual representa a sede municipal; ponto exato da placa ainda não confirmado."
  },
  {
    name: "Pão de Açúcar",
    lat: -9.750112,
    lng: -37.435620,
    elevation: 11,
    verifiedPlaque: true,
    description: "Ponto verificado da placa física do Caminho do Imperador em Pão de Açúcar."
  },
  {
    name: "Piranhas",
    lat: -9.6240,
    lng: -37.7570,
    elevation: null,
    verifiedPlaque: false,
    description: "Município da rota. Coordenada atual representa a sede municipal; ponto exato da placa ainda não confirmado."
  },
  {
    name: "Olho d’Água do Casado",
    lat: -9.5036,
    lng: -37.8301,
    elevation: null,
    verifiedPlaque: false,
    description: "Município da rota. Coordenada atual representa a sede municipal; ponto exato da placa ainda não confirmado."
  },
  {
    name: "Delmiro Gouveia",
    lat: -9.3841,
    lng: -37.9978,
    elevation: null,
    verifiedPlaque: false,
    description: "Município da rota. Coordenada atual representa a sede municipal; ponto exato da placa ainda não confirmado."
  },
  {
    name: "Água Branca",
    lat: -9.2620,
    lng: -37.9380,
    elevation: null,
    verifiedPlaque: false,
    description: "Município da rota. Coordenada atual representa a sede municipal; ponto exato da placa ainda não confirmado."
  }
];

const map = L.map("map", {
  zoomControl: true,
  scrollWheelZoom: true
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const latLngs = cities.map(city => [city.lat, city.lng]);

const fullRoute = L.polyline(latLngs, {
  color: "#d39a32",
  weight: 5,
  opacity: 0.72,
  dashArray: "10 9",
  lineCap: "round"
}).addTo(map);

const completedRoute = L.polyline([], {
  color: "#7c4d00",
  weight: 8,
  opacity: 1,
  lineCap: "round"
}).addTo(map);

map.fitBounds(fullRoute.getBounds(), { padding: [48, 48] });

const markers = [];
let activeIndex = 0;
let playTimer = null;
let playing = false;

const cityList = document.getElementById("cityList");
const cityName = document.getElementById("cityName");
const cityDescription = document.getElementById("cityDescription");
const coordinates = document.getElementById("coordinates");
const osmLink = document.getElementById("osmLink");
const stageNumber = document.getElementById("stageNumber");
const progressText = document.getElementById("progressText");
const fitRouteButton = document.getElementById("fitRoute");
const playRouteButton = document.getElementById("playRoute");

function markerIcon(index, verified) {
  return L.divIcon({
    className: `numbered-marker ${verified ? "verified-marker" : "approx-marker"} marker-${index}`,
    html: verified ? `📍${String(index + 1).padStart(2, "0")}` : String(index + 1).padStart(2, "0"),
    iconSize: [verified ? 42 : 32, 32]
  });
}

cities.forEach((city, index) => {
  const marker = L.marker([city.lat, city.lng], {
    icon: markerIcon(index, city.verifiedPlaque),
    title: city.name
  }).addTo(map);

  let popup = `<strong>${index + 1}. ${city.name}</strong><br>`;
  popup += city.verifiedPlaque
    ? `<span class="popup-status">✓ Placa verificada</span><br>`
    : `<span class="popup-status approx">• Coordenada municipal aproximada</span><br>`;
  if (city.elevation !== null) popup += `Elevação: ${city.elevation} m<br>`;
  popup += `${city.lat.toFixed(6)}, ${city.lng.toFixed(6)}<br>`;
  popup += `<small>${city.description}</small>`;

  marker.bindPopup(popup, { maxWidth: 300 });

  marker.on("click", () => {
    stopPlaying();
    selectCity(index, true);
  });

  markers.push(marker);

  const li = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "city-button";
  button.dataset.index = index;
  button.innerHTML = `
    <span class="city-index">${String(index + 1).padStart(2, "0")}</span>
    <span class="city-title">
      ${city.name}
      <small class="${city.verifiedPlaque ? "verified-label" : "approx-label"}">
        ${city.verifiedPlaque ? "✓ placa verificada" : "coordenada municipal"}
      </small>
    </span>
    <span class="city-arrow">›</span>
  `;

  button.addEventListener("click", () => {
    stopPlaying();
    selectCity(index, true);
    if (window.innerWidth <= 760) setMobileMenu(false);
  });

  li.appendChild(button);
  cityList.appendChild(li);
});

function selectCity(index, pan = false) {
  activeIndex = Math.max(0, Math.min(cities.length - 1, index));
  const city = cities[activeIndex];

  cityName.textContent = city.name;
  cityDescription.textContent = city.description;

  const elev = city.elevation !== null ? ` • ${city.elevation} m` : "";
  coordinates.textContent = `${city.lat.toFixed(6)}, ${city.lng.toFixed(6)}${elev}`;
  osmLink.href = `https://www.openstreetmap.org/?mlat=${city.lat}&mlon=${city.lng}#map=16/${city.lat}/${city.lng}`;
  stageNumber.textContent = String(activeIndex + 1).padStart(2, "0");
  progressText.textContent = `${activeIndex + 1} de ${cities.length}`;
  if (mobileActiveCity) mobileActiveCity.textContent = city.name;
  if (mobileCityName) mobileCityName.textContent = city.name;
  if (mobileStage) mobileStage.textContent = String(activeIndex + 1).padStart(2, "0");
  if (mobileCityStatus) {
    mobileCityStatus.textContent = city.verifiedPlaque ? "Placa verificada" : "Coordenada municipal";
  }
  if (mobileSheetStage) mobileSheetStage.textContent = String(activeIndex + 1).padStart(2, "0");
  if (mobileSheetCity) mobileSheetCity.textContent = city.name;
  if (mobileSheetDescription) mobileSheetDescription.textContent = city.description;
  if (mobileSheetCoordinates) mobileSheetCoordinates.textContent = `${city.lat.toFixed(6)}, ${city.lng.toFixed(6)}`;
  if (mobileSheetElevation) {
    mobileSheetElevation.textContent = city.elevation !== null ? `Elevação: ${city.elevation} m` : "";
  }
  if (mobileSheetOsmLink) {
    mobileSheetOsmLink.href = `https://www.openstreetmap.org/?mlat=${city.lat}&mlon=${city.lng}#map=16/${city.lat}/${city.lng}`;
  }
  if (mobilePrevCity) mobilePrevCity.disabled = activeIndex === 0;
  if (mobileNextCity) mobileNextCity.disabled = activeIndex === cities.length - 1;

  document.querySelectorAll(".city-button").forEach((button, i) => {
    button.classList.toggle("active", i === activeIndex);
    if (i === activeIndex) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });

  markers.forEach((marker, i) => {
    const el = marker.getElement();
    if (el) el.classList.toggle("active", i === activeIndex);
  });

  completedRoute.setLatLngs(latLngs.slice(0, activeIndex + 1));

  if (pan) {
    map.flyTo([city.lat, city.lng], city.verifiedPlaque ? 16 : 12, {
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.8
    });
    markers[activeIndex].openPopup();
  }
}

function stopPlaying() {
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
  }
  playing = false;
  playRouteButton.textContent = "▶ Percorrer rota";
  playRouteButton.classList.remove("is-playing");
}

function startPlaying() {
  stopPlaying();
  playing = true;
  playRouteButton.textContent = "■ Parar";
  playRouteButton.classList.add("is-playing");

  if (activeIndex >= cities.length - 1) activeIndex = 0;

  selectCity(activeIndex, true);

  playTimer = setInterval(() => {
    if (activeIndex >= cities.length - 1) {
      stopPlaying();
      map.fitBounds(fullRoute.getBounds(), { padding: [48, 48] });
      return;
    }
    selectCity(activeIndex + 1, true);
  }, 1800);
}

playRouteButton.addEventListener("click", () => {
  if (playing) stopPlaying();
  else startPlaying();
});

fitRouteButton.addEventListener("click", () => {
  stopPlaying();
  map.fitBounds(fullRoute.getBounds(), { padding: [48, 48] });
});

selectCity(0, false);const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const mobileMenuClose = document.getElementById("mobileMenuClose");
const mobileBackdrop = document.getElementById("mobileBackdrop");
const mobileFitRoute = document.getElementById("mobileFitRoute");
const mobileCityCard = document.getElementById("mobileCityCard");
const mobileActiveCity = document.getElementById("mobileActiveCity");
const mobileCityName = document.getElementById("mobileCityName");
const mobileCityStatus = document.getElementById("mobileCityStatus");
const mobileStage = document.getElementById("mobileStage");

function setMobileMenu(open) {
  document.body.classList.toggle("mobile-menu-open", open);
  mobileMenuToggle?.setAttribute("aria-expanded", open ? "true" : "false");
  if (mobileBackdrop) mobileBackdrop.hidden = !open;
  setTimeout(() => map.invalidateSize(), 260);
}

mobileMenuToggle?.addEventListener("click", () => { setMobileSheet(false); setMobileMenu(true); });
mobileMenuClose?.addEventListener("click", () => setMobileMenu(false));
mobileBackdrop?.addEventListener("click", () => setMobileMenu(false));

mobileFitRoute?.addEventListener("click", () => {
  stopPlaying();
  map.fitBounds(fullRoute.getBounds(), { padding: [42, 42] });
});



document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("mobile-menu-open")) {
    setMobileMenu(false);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    setMobileMenu(false);
  }
  setTimeout(() => map.invalidateSize(), 100);
});const mobileBottomSheet = document.getElementById("mobileBottomSheet");
const mobileSheetHandle = document.getElementById("mobileSheetHandle");
const mobileSheetStage = document.getElementById("mobileSheetStage");
const mobileSheetCity = document.getElementById("mobileSheetCity");
const mobileSheetDescription = document.getElementById("mobileSheetDescription");
const mobileSheetCoordinates = document.getElementById("mobileSheetCoordinates");
const mobileSheetElevation = document.getElementById("mobileSheetElevation");
const mobileSheetOsmLink = document.getElementById("mobileSheetOsmLink");
const mobilePrevCity = document.getElementById("mobilePrevCity");
const mobileNextCity = document.getElementById("mobileNextCity");

function setMobileSheet(open) {
  if (!mobileBottomSheet || !mobileCityCard) return;

  mobileBottomSheet.classList.toggle("open", open);
  mobileBottomSheet.setAttribute("aria-hidden", open ? "false" : "true");
  mobileCityCard.classList.toggle("sheet-open", open);
  mobileCityCard.setAttribute("aria-expanded", open ? "true" : "false");
  document.body.classList.toggle("mobile-sheet-open", open);
}

mobileCityCard?.addEventListener("click", () => setMobileSheet(true));
mobileSheetHandle?.addEventListener("click", () => setMobileSheet(false));

mobilePrevCity?.addEventListener("click", () => {
  if (activeIndex <= 0) return;
  selectCity(activeIndex - 1, true);
});

mobileNextCity?.addEventListener("click", () => {
  if (activeIndex >= cities.length - 1) return;
  selectCity(activeIndex + 1, true);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("mobile-sheet-open")) {
    setMobileSheet(false);
  }
});