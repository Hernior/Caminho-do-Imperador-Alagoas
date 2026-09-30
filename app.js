(() => {
  "use strict";

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

  const el = {
    cityList: document.getElementById("cityList"),
    cityName: document.getElementById("cityName"),
    cityDescription: document.getElementById("cityDescription"),
    coordinates: document.getElementById("coordinates"),
    osmLink: document.getElementById("osmLink"),
    stageNumber: document.getElementById("stageNumber"),
    progressText: document.getElementById("progressText"),
    fitRoute: document.getElementById("fitRoute"),
    playRoute: document.getElementById("playRoute"),

    mobileMenuToggle: document.getElementById("mobileMenuToggle"),
    mobileMenuClose: document.getElementById("mobileMenuClose"),
    mobileBackdrop: document.getElementById("mobileBackdrop"),
    mobileFitRoute: document.getElementById("mobileFitRoute"),

    mobileCityCard: document.getElementById("mobileCityCard"),
    mobileActiveCity: document.getElementById("mobileActiveCity"),
    mobileCityName: document.getElementById("mobileCityName"),
    mobileCityStatus: document.getElementById("mobileCityStatus"),
    mobileStage: document.getElementById("mobileStage"),

    mobileBottomSheet: document.getElementById("mobileBottomSheet"),
    mobileSheetHandle: document.getElementById("mobileSheetHandle"),
    mobileSheetStage: document.getElementById("mobileSheetStage"),
    mobileSheetCity: document.getElementById("mobileSheetCity"),
    mobileSheetDescription: document.getElementById("mobileSheetDescription"),
    mobileSheetCoordinates: document.getElementById("mobileSheetCoordinates"),
    mobileSheetElevation: document.getElementById("mobileSheetElevation"),
    mobileSheetOsmLink: document.getElementById("mobileSheetOsmLink"),
    mobilePrevCity: document.getElementById("mobilePrevCity"),
    mobileNextCity: document.getElementById("mobileNextCity")
  };

  if (typeof L === "undefined") {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div style="position:fixed;z-index:99999;inset:12px auto auto 12px;background:#7f1d1d;color:white;padding:12px 16px;border-radius:10px;font:14px system-ui">Não foi possível carregar o mapa. Verifique a conexão com a internet.</div>'
    );
    return;
  }

  const map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: true
  });

  const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  });

  tiles.on("loading", () => console.info("[tiles] loading"));
  tiles.on("load", () => console.info("[tiles] load"));
  tiles.on("tileerror", (event) => {
    console.error("[tiles] tileerror", event.tile && event.tile.src, event.error);
  });
  tiles.addTo(map);

  const latLngs = cities.map((city) => [city.lat, city.lng]);

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

  const markers = [];
  let activeIndex = 0;
  let playTimer = null;
  let playing = false;
  let refreshFrame = null;
  let fitPending = false;

  function isMobile() {
    return window.matchMedia("(max-width: 760px)").matches;
  }

  function refreshMapSize(fitRoute = false) {
    fitPending = fitPending || fitRoute;
    if (refreshFrame !== null) return;

    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = null;
      const container = map.getContainer();
      if (!container.clientWidth || !container.clientHeight) return;

      map.invalidateSize({ pan: false, debounceMoveend: true });
      if (fitPending) {
        fitPending = false;
        map.fitBounds(fullRoute.getBounds(), {
          paddingTopLeft: isMobile() ? [28, 88] : [48, 48],
          paddingBottomRight: isMobile() ? [28, 110] : [48, 48]
        });
      }
    });
  }

  function fitWholeRoute() {
    refreshMapSize(true);
  }

  function setMobileMenu(open) {
    if (document.body.classList.contains("mobile-menu-open") === open) return;
    document.body.classList.toggle("mobile-menu-open", open);

    if (el.mobileMenuToggle) {
      el.mobileMenuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    if (el.mobileBackdrop) {
      el.mobileBackdrop.hidden = !open;
    }

    if (open) {
      setMobileSheet(false);
    }

    refreshMapSize();
  }

  function setMobileSheet(open) {
    if (!el.mobileBottomSheet || !el.mobileCityCard) return;
    if (document.body.classList.contains("mobile-sheet-open") === open) return;

    el.mobileBottomSheet.classList.toggle("open", open);
    el.mobileBottomSheet.setAttribute("aria-hidden", open ? "false" : "true");

    el.mobileCityCard.classList.toggle("sheet-open", open);
    el.mobileCityCard.setAttribute("aria-expanded", open ? "true" : "false");

    document.body.classList.toggle("mobile-sheet-open", open);

    if (open) {
      setMobileMenu(false);
    }

    refreshMapSize();
  }

  function markerIcon(index, verified) {
    return L.divIcon({
      className: `numbered-marker ${verified ? "verified-marker" : "approx-marker"} marker-${index}`,
      html: verified
        ? `📍${String(index + 1).padStart(2, "0")}`
        : String(index + 1).padStart(2, "0"),
      iconSize: [verified ? 42 : 32, 32]
    });
  }

  function stopPlaying() {
    if (playTimer !== null) {
      window.clearInterval(playTimer);
      playTimer = null;
    }

    playing = false;

    if (el.playRoute) {
      el.playRoute.textContent = "▶ Percorrer rota";
      el.playRoute.classList.remove("is-playing");
      el.playRoute.setAttribute("aria-label", "Percorrer rota");
    }
  }

  function selectCity(index, pan = false) {
    activeIndex = Math.max(0, Math.min(cities.length - 1, index));
    const city = cities[activeIndex];
    const stage = String(activeIndex + 1).padStart(2, "0");
    const verifiedText = city.verifiedPlaque ? "Placa verificada" : "Coordenada municipal";
    const osmHref = `https://www.openstreetmap.org/?mlat=${city.lat}&mlon=${city.lng}#map=16/${city.lat}/${city.lng}`;

    if (el.cityName) el.cityName.textContent = city.name;
    if (el.cityDescription) el.cityDescription.textContent = city.description;
    if (el.coordinates) {
      const elevation = city.elevation !== null ? ` • ${city.elevation} m` : "";
      el.coordinates.textContent = `${city.lat.toFixed(6)}, ${city.lng.toFixed(6)}${elevation}`;
    }
    if (el.osmLink) el.osmLink.href = osmHref;
    if (el.stageNumber) el.stageNumber.textContent = stage;
    if (el.progressText) el.progressText.textContent = `${activeIndex + 1} de ${cities.length}`;

    if (el.mobileActiveCity) el.mobileActiveCity.textContent = city.name;
    if (el.mobileCityName) el.mobileCityName.textContent = city.name;
    if (el.mobileCityStatus) el.mobileCityStatus.textContent = verifiedText;
    if (el.mobileStage) el.mobileStage.textContent = stage;

    if (el.mobileSheetStage) el.mobileSheetStage.textContent = stage;
    if (el.mobileSheetCity) el.mobileSheetCity.textContent = city.name;
    if (el.mobileSheetDescription) el.mobileSheetDescription.textContent = city.description;
    if (el.mobileSheetCoordinates) {
      el.mobileSheetCoordinates.textContent = `${city.lat.toFixed(6)}, ${city.lng.toFixed(6)}`;
    }
    if (el.mobileSheetElevation) {
      el.mobileSheetElevation.textContent =
        city.elevation !== null ? `Elevação: ${city.elevation} m` : "";
    }
    if (el.mobileSheetOsmLink) el.mobileSheetOsmLink.href = osmHref;
    if (el.mobilePrevCity) el.mobilePrevCity.disabled = activeIndex === 0;
    if (el.mobileNextCity) el.mobileNextCity.disabled = activeIndex === cities.length - 1;

    document.querySelectorAll(".city-button").forEach((button, buttonIndex) => {
      const active = buttonIndex === activeIndex;
      button.classList.toggle("active", active);

      if (active) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });

    markers.forEach((marker, markerIndex) => {
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.classList.toggle("active", markerIndex === activeIndex);
      }
    });

    completedRoute.setLatLngs(latLngs.slice(0, activeIndex + 1));

    if (pan) {
      const targetZoom = city.verifiedPlaque ? 15 : 12;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      map.flyTo([city.lat, city.lng], targetZoom, {
        duration: reducedMotion ? 0 : 0.65
      });

      markers[activeIndex].openPopup();
    }
  }

  function startPlaying() {
    stopPlaying();

    if (activeIndex >= cities.length - 1) {
      activeIndex = 0;
    }

    playing = true;

    if (el.playRoute) {
      el.playRoute.textContent = "■ Parar";
      el.playRoute.classList.add("is-playing");
      el.playRoute.setAttribute("aria-label", "Parar percurso");
    }

    setMobileSheet(false);
    selectCity(activeIndex, true);

    playTimer = window.setInterval(() => {
      if (activeIndex >= cities.length - 1) {
        stopPlaying();
        fitWholeRoute();
        return;
      }

      selectCity(activeIndex + 1, true);
    }, 1800);
  }

  cities.forEach((city, index) => {
    const marker = L.marker([city.lat, city.lng], {
      icon: markerIcon(index, city.verifiedPlaque),
      title: city.name
    }).addTo(map);

    let popup = `<strong>${index + 1}. ${city.name}</strong><br>`;
    popup += city.verifiedPlaque
      ? '<span class="popup-status">✓ Placa verificada</span><br>'
      : '<span class="popup-status approx">• Coordenada municipal aproximada</span><br>';

    if (city.elevation !== null) {
      popup += `Elevação: ${city.elevation} m<br>`;
    }

    popup += `${city.lat.toFixed(6)}, ${city.lng.toFixed(6)}<br>`;
    popup += `<small>${city.description}</small>`;

    marker.bindPopup(popup, { maxWidth: 300 });

    marker.on("click", () => {
      stopPlaying();
      selectCity(index, false);

      marker.closePopup();
      setMobileSheet(true);
    });

    markers.push(marker);

    if (el.cityList) {
      const item = document.createElement("li");
      const button = document.createElement("button");

      button.type = "button";
      button.className = "city-button";
      button.dataset.index = String(index);
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

        setMobileMenu(false);
        window.setTimeout(() => setMobileSheet(true), 250);
      });

      item.appendChild(button);
      el.cityList.appendChild(item);
    }
  });

  el.playRoute?.addEventListener("click", () => {
    if (playing) stopPlaying();
    else startPlaying();
  });

  el.fitRoute?.addEventListener("click", () => {
    stopPlaying();
    setMobileSheet(false);
    fitWholeRoute();
  });

  el.mobileFitRoute?.addEventListener("click", () => {
    stopPlaying();
    setMobileSheet(false);
    fitWholeRoute();
  });

  el.mobileMenuToggle?.addEventListener("click", () => {
    setMobileMenu(!document.body.classList.contains("mobile-menu-open"));
  });

  el.mobileMenuClose?.addEventListener("click", () => {
    setMobileMenu(false);
  });

  el.mobileBackdrop?.addEventListener("click", () => {
    setMobileMenu(false);
  });

  el.mobileCityCard?.addEventListener("click", () => {
    setMobileSheet(true);
  });

  el.mobileSheetHandle?.addEventListener("click", () => {
    setMobileSheet(false);
  });

  el.mobilePrevCity?.addEventListener("click", () => {
    if (activeIndex <= 0) return;
    stopPlaying();
    selectCity(activeIndex - 1, true);
  });

  el.mobileNextCity?.addEventListener("click", () => {
    if (activeIndex >= cities.length - 1) return;
    stopPlaying();
    selectCity(activeIndex + 1, true);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (document.body.classList.contains("mobile-sheet-open")) {
      setMobileSheet(false);
      return;
    }

    if (document.body.classList.contains("mobile-menu-open")) {
      setMobileMenu(false);
    }
  });

  window.addEventListener("load", () => refreshMapSize(), { once: true });
  window.addEventListener("resize", () => refreshMapSize());
  window.addEventListener("orientationchange", () => refreshMapSize());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshMapSize();
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => refreshMapSize()).observe(map.getContainer());
  }

  fitWholeRoute();
  selectCity(0, false);
})();
