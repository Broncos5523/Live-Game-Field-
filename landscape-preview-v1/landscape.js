/* Venue codes supplied by the original landscape preview ZIP. */
const landscapeVenueCodes = {
  CBB: new Set((
    "AFA AKR ALA ARIZ ARK ASU AUB BAY BC BOIS BTLR BYU CAL CIN CLEM COLO " +
    "CONN CREI CSU DAY DEP DRKE DUKE FAU FLA FRES FSU GCU GONZ GT GTWN HALL " +
    "HAW HOU ILL IND IOWA ISU KSU KU LIB LOU LSU M-OH MARQ MCN MD MEM " +
    "MIA MICH MINN MISS MIZ MSST MSU NCSU ND NEB NEV NU OKST ORE ORST OSU " +
    "OU PITT PRIN PROV PSU PUR RUTG SC SDSU SJSU SJU SLU SMC SMU STAN SYR " +
    "TA&M TCU TEM TENN TEX TTU TXST UAB UCD UCF UCLA UGA UK UNC UNLV UNM " +
    "USC USF USU UTAH UTEP UVA VAN VCU VILL VT WAKE WASH WICH WIS WKU WSU " +
    "WVU WYO XAV"
  ).split(" ")),
  CFB: new Set((
    "AFA APP CCU DEL FIU HAW ILST JMU JVST KENN LIB MOST MRSH MTST MTSU ND " +
    "NDSU NEV NIU NMSU SDST SHSU SJSU TARL TOL UL UND UNLV UNM UTAH UTEP UTSA " +
    "WKU WMU WYO"
  ).split(" ")),
  MLB: new Set((
    "ARI ATH ATL BAL BOS CHC CHW CIN CLE COL DET HOU KC LAA LAD MIA " +
    "MIL MIN NYM NYY PHI PIT SD SEA SF STL TB TEX TOR WSH"
  ).split(" ")),
  NBA: new Set((
    "ATL BKN BOS CHA CHI CLE DAL DEN DET GS HOU IND LAC LAL MEM MIA " +
    "MIL MIN NO NY OKC ORL PHI PHX POR SA SAC TOR UTAH WSH"
  ).split(" ")),
  NFL: new Set((
    "ARI ATL BAL BUF CAR CHI CIN CLE DAL DEN DET GB HOU IND JAX KC " +
    "LAC LAR LV MIA MIN NE NO NYG NYJ PHI PIT SEA SF TB TEN WSH"
  ).split(" ")),
  NHL: new Set((
    "ANA BOS BUF CAR CBJ CGY CHI COL DAL DET EDM FLA LA MIN MTL NJ " +
    "NSH NYI NYR OTT PHI PIT SEA SJ STL TB TOR UTAH VAN VGK WPG WSH"
  ).split(" ")),
  WNBA: new Set((
    "ATL CHI CON DAL GS IND LA LV MIN NY PHX POR SEA TOR WSH"
  ).split(" ")),
};

function hasLandscapeVenue(sport, code) {
  return landscapeVenueCodes[sport]?.has(code) ?? false;
}

/* Synchronize the dashboard's loaded venue art with the landscape background. */
(function () {
  function syncVenue() {
    const dashboard = document.querySelector(".dashboard");
    if (!dashboard) return;

    let background = dashboard.querySelector(".landscape-venue");
    if (!background) {
      background = document.createElement("div");
      background.className = "landscape-venue";
      background.setAttribute("aria-hidden", "true");
      dashboard.prepend(background);
    }

    const original = dashboard.querySelector(".venue-backdrop");
    const src = original?.complete && original.naturalWidth > 0
      ? original.currentSrc || original.src
      : "";
    // Approved venue images always win. For missing or failed images,
    // use an unlabeled existing venue image from the same league.
    const league = [...dashboard.classList].find(x=>x.startsWith("sport-"))?.slice(6).toUpperCase();
    const genericVenueCode = {NFL:"DEN",CFB:"UTAH",NBA:"BOS",WNBA:"IND",NHL:"BOS",MLB:"BOS",CBB:"DUKE"};
    const code = genericVenueCode[league];
    const fallback = code ? "./assets/venues/"+league+"/"+code+".webp" : "";
    const chosen = src || fallback;
    if (background.dataset.src === chosen) return;

    background.dataset.src = chosen;
    background.replaceChildren();
    if (chosen) {
      const image = document.createElement("img");
      image.alt = "";
      image.onerror = () => { if (background.contains(image)) { image.remove(); background.dataset.src = chosen; } };
      image.src = chosen;
      background.appendChild(image);
    }
  }

  window.setInterval(syncVenue, 900);
  document.addEventListener("visibilitychange", syncVenue);
  syncVenue();
})();
