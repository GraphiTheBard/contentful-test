const client = contentful.createClient({
  space: "80qcbh7fbkhr",
  accessToken: "HdS3u9MOfM0ZDHPETdrikIFV4yyXs8lW5vT3fMnUS1k",
});

let allBikes = [];
let bikeTypes = [];
let currentType = null;

async function fetchBikes() {
  try {
    const entries = await client.getEntries({
      content_type: "harleyListing",
      include: 2,
    });

    console.log(entries);

    allBikes = entries.items.map((item) => {
      const fields = item.fields;

      const bikeType = Array.isArray(fields.bikeType)
        ? fields.bikeType[0]
        : fields.bikeType;

      const colours = fields.bikeColour || [];
      const images = fields.bikeImage || [];
      const imageUrls = [];
      images.forEach((img) => {
        if (img?.fields?.file?.url) {
          const url = img.fields.file.url;
          const fullUrl = url.startsWith("//") ? `https:${url}` : url;
          imageUrls.push(fullUrl);
        }
      });

      return {
        id: fields.id,
        bikeName: fields.bikeModel,
        bikePrice: formatPrice(fields.bikePrice),
        bikeType: bikeType,
        bikeImages: imageUrls,
        colours: colours,
      };
    });

    bikeTypes = [...new Set(allBikes.map((b) => b.bikeType))];
    renderNavBar();
    renderBikes();
  } catch (error) {
    console.error(error);
    document.getElementById("bikes-container").innerHTML =
      '<div class="error">Failed</div>';
    document.getElementById("nav-buttons").innerHTML =
      '<div class="error">Failed</div>';
  }
}

function formatPrice(price) {
  if (!price) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function renderNavBar() {
  const nav = document.getElementById("nav-buttons");
  nav.innerHTML = "";

  if (bikeTypes.length === 0) {
    nav.innerHTML = '<div class="no-bikes">No categories</div>';
    return;
  }

  bikeTypes.forEach((type, index) => {
    const btn = document.createElement("button");
    btn.textContent = type;
    btn.className = `nav-btn ${index === 0 ? "active" : ""}`;
    btn.onclick = () => {
      currentType = type;
      updateActiveButton(btn);
      renderBikes();
    };
    nav.appendChild(btn);
  });

  if (bikeTypes.length > 0) {
    currentType = bikeTypes[0];
  }
}

function updateActiveButton(activeBtn) {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  activeBtn.classList.add("active");
}

function renderBikes() {
  const container = document.getElementById("bikes-container");
  container.innerHTML = "";

  const bikesToShow = currentType
    ? allBikes.filter((b) => b.bikeType === currentType)
    : allBikes;

  if (bikesToShow.length === 0) {
    container.innerHTML = '<div class="no-bikes">No bikes</div>';
    return;
  }

  bikesToShow.forEach((bike) => {
    const card = document.createElement("div");
    card.className = "bike-card";
    card.onclick = () => {
      window.location.href = `/contentful-test/details.html?id=${encodeURIComponent(
        bike.id
      )}`;
    };

    const initialImage = bike.bikeImages.length > 0 ? bike.bikeImages[0] : "";

    const imgDiv = document.createElement("div");
    imgDiv.className = "bike-image";
    imgDiv.innerHTML = `<img src="${initialImage}" alt="${bike.bikeName}" ">`;

    const detailsDiv = document.createElement("div");
    detailsDiv.className = "bike-details";

    const nameDiv = document.createElement("div");
    nameDiv.className = "bike-name";
    nameDiv.textContent = bike.bikeName;

    const priceDiv = document.createElement("div");
    priceDiv.className = "bike-price";
    priceDiv.textContent = bike.bikePrice;

    const coloursDiv = document.createElement("div");
    coloursDiv.className = "bike-colours";

    if (bike.colours && bike.colours.length > 0) {
      bike.colours.forEach((colorHex, colorIndex) => {
        const swatch = document.createElement("span");
        swatch.className = `color-swatch ${colorIndex === 0 ? "active" : ""}`;
        swatch.style.background = colorHex;
        swatch.setAttribute("data-color", colorHex);
        swatch.title = colorHex;

        swatch.onclick = () => {
          card
            .querySelectorAll(".color-swatch")
            .forEach((s) => s.classList.remove("active"));
          swatch.classList.add("active");

          const imgTag = card.querySelector("img");
          const bikeId = bike.id;

          const colorSpecificImage = bike.bikeImages.find(
            (img) =>
              img.includes(colorHex.replace("#", "")) ||
              img.includes(bikeId + "_" + colorHex.replace("#", ""))
          );

          if (colorSpecificImage) {
            console.log(colorSpecificImage);

            imgTag.src = colorSpecificImage;
          } else {
            imgTag.src = bike.bikeImages[0] || "";
          }

          console.log(bike.bikeImages);
        };

        coloursDiv.appendChild(swatch);
      });
    }

    detailsDiv.appendChild(nameDiv);
    detailsDiv.appendChild(priceDiv);
    if (bike.colours && bike.colours.length > 0) {
      detailsDiv.appendChild(coloursDiv);
    }

    card.appendChild(imgDiv);
    card.appendChild(detailsDiv);
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", fetchBikes);
