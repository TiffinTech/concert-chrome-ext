class Storage {
  constructor() {
    this.storage = window.localStorage;
    this.page = this.page ?? 1;
    this.minDate = this.minDate ?? new Date().toLocaleDateString("en-CA");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.maxDate =
      this.maxDate ?? new Date(tomorrow).toLocaleDateString("en-CA");
    this.location = this.location ?? "Toronto";
  }

  get data() {
    return {
      location: this.location,
      page: this.page,
      minDate: this.minDate,
      maxDate: this.maxDate,
    };
  }

  get location() {
    return this.storage.getItem("concert_location");
  }

  set location(value) {
    this.storage.setItem("concert_location", value);
  }

  get page() {
    return this.storage.getItem("concert_page");
  }

  set page(value) {
    this.storage.setItem("concert_page", value);
  }

  get minDate() {
    return this.storage.getItem("concert_minDate");
  }

  set minDate(value) {
    this.storage.setItem("concert_minDate", value);
  }

  get maxDate() {
    return this.storage.getItem("concert_maxDate");
  }

  set maxDate(value) {
    this.storage.setItem("concert_maxDate", value);
  }
}

async function linkForm() {
  const formElement = document.getElementById("concert_form");
  const storage = new Storage();

  for (const inputField of formElement.querySelectorAll(
    ".input_container > input"
  )) {
    const name = inputField.getAttribute("name");
    inputField.value = storage[name];
  }

  formElement.addEventListener("submit", async function (e) {
    e.preventDefault();

    for (const inputField of formElement.querySelectorAll(
      ".input_container > input"
    )) {
      const name = inputField.getAttribute("name");
      storage[name] = inputField.value;
    }

    await updateConcerts(storage.data);
  });
}

function updateHeading(location) {
  const heading = document.getElementById("concert_heading");
  heading.innerText = `Upcoming ${location} Concerts`;
}

function dateToLocale(date) {
  return new Date(Date.parse(date)).toLocaleString();
}

function makeMap({ latitude, longitude, name }) {
  const map_link = document.createElement("a");
  map_link.href = `https://www.google.com/maps/search/${latitude},${longitude}`;
  map_link.target = "_blank";
  map_link.title = name;

  const img = document.createElement("img");
  img.src = "map.svg";
  img.alt = name;
  img.classList.add("concert_location");

  map_link.appendChild(img);
  return map_link;
}

function createConcert({
  image,
  event_name,
  event_description,
  location,
  date,
}) {
  const li = document.createElement("li");
  const concertContainer = document.createElement("div");
  concertContainer.classList.add("concert_container");

  const concertImage = document.createElement("img");
  concertImage.classList.add("concert_image");
  concertImage.src = image;
  concertImage.alt = "Image of Concert";

  const concertName = document.createElement("span");
  concertName.classList.add("concert_name");
  concertName.title = event_description;
  concertName.innerText = event_name;

  const concertDetail = document.createElement("span");
  concertDetail.classList.add("concert_detail");

  const showDate = document.createElement("span");
  showDate.innerText = dateToLocale(date);

  concertDetail.appendChild(makeMap(location));
  concertDetail.appendChild(showDate);

  concertContainer.appendChild(concertImage);
  concertContainer.appendChild(concertName);
  concertContainer.appendChild(concertDetail);

  li.appendChild(concertContainer);

  return li;
}

async function fetchData({ location, minDate, maxDate, page }) {
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "[INSERT API KEY]",
      "X-RapidAPI-Host": "concerts-artists-events-tracker.p.rapidapi.com",
    },
  };

  const res = await fetch(
    `https://concerts-artists-events-tracker.p.rapidapi.com/location?name=${location}&minDate=${minDate}&maxDate=${maxDate}&page=${page}`,
    options
  );
  return res.json();
}

async function updateConcerts({ location, minDate, maxDate, page }) {
  let data;
  try {
    ({ data } = await fetchData({ location, minDate, maxDate, page }));
  } catch (e) {
    throw new Error("Could not fetch the data");
  }

  if (!data || data.length === 0) throw new Error("Data not recieved");

  updateHeading(location);

  document.getElementById("concert_list").replaceChildren([]);
  data.map((concertData) => {
    const concertElement = createConcert({
      image: concertData.image,
      event_name: concertData.name,
      event_description: concertData.description,
      location: {
        name: concertData.location.name,
        latitude: concertData.location.geo.latitude,
        longitude: concertData.location.geo.longitude,
      },
      date: concertData.startDate,
    });
    document.getElementById("concert_list").appendChild(concertElement);
  });
}

async function main() {
  const storage = new Storage();
  await updateConcerts(storage.data);
  linkForm();
}

window.addEventListener("load", () => main().catch(console.error));
