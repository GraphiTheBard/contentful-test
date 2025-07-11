const client = contentful.createClient({
  space: "80qcbh7fbkhr",
  accessToken: "HdS3u9MOfM0ZDHPETdrikIFV4yyXs8lW5vT3fMnUS1k",
});

function formatPrice(price) {
  if (!price) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

async function fetchBikeDetails(id) {
  try {
    const entries = await client.getEntries({
      content_type: "harleyListing",
      "fields.id": id,
      include: 2,
    });

    if (!entries.items.length) {
      document.body.innerHTML = "<h2>Bike not found</h2>";
      return;
    }

    const bike = entries.items[0].fields;
    const bikeName = bike.bikeModel;
    const bikePrice = formatPrice(bike.bikePrice);
    const bikeType = Array.isArray(bike.bikeType)
      ? bike.bikeType[0]
      : bike.bikeType;
    const colours = bike.bikeColour || [];
    const images = bike.bikeImage || [];
    const imageUrls = images.map((img) =>
      img?.fields?.file?.url
        ? img.fields.file.url.startsWith("//")
          ? `https:${img.fields.file.url}`
          : img.fields.file.url
        : ""
    );

    document.body.innerHTML = `
        <div class="details-card">
        
          <h2 class="bike-model">${bikeName}</h2>
     
          <div class="bike-price"><span style="font-weight:100; "> Starting at: </span> <strong> ${bikePrice}</strong></div>
          <div class="image-container">
             <img id="main-bike-image" src="${imageUrls[0]}" alt="${bikeName}" />
         </div>

        </div>
      `;
    if (colours.length > 0) {
      const swatchContainer = document.createElement("div");
      swatchContainer.className = "swatch-container";
      document.querySelector(".details-card").appendChild(swatchContainer);

      const mainImage = document.getElementById("main-bike-image");

      colours.forEach((colorHex, index) => {
        const swatch = document.createElement("span");
        swatch.className = `color-swatch ${index === 0 ? "active" : ""}`;
        swatch.style.cssText = `
            display:inline-block;
            width:20px;
            height:20px;
            background:${colorHex};
            margin-right:5px;
            border:1px solid #ccc;
            cursor:pointer;
          `;
        swatch.title = colorHex;

        swatch.onclick = () => {
          document
            .querySelectorAll(".color-swatch")
            .forEach((s) => s.classList.remove("active"));
          swatch.classList.add("active");

          const matchedImage = imageUrls.find((url) =>
            url.toLowerCase().includes(colorHex.replace("#", "").toLowerCase())
          );

          if (matchedImage) {
            mainImage.src = matchedImage;
          } else {
            mainImage.src = imageUrls[0];
          }
        };

        swatchContainer.appendChild(swatch);
      });
    }
  } catch (e) {
    document.body.innerHTML = "<h2>Error loading bike details</h2>";
  }
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
if (id) {
  fetchBikeDetails(id);
} else {
  document.body.innerHTML = "<h2>No bike found</h2>";
}
