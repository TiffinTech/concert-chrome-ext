async function fetchData({
  location = "Toronto",
  minDate = "2022-10-01",
  maxDate = "2022-10-01",
  page = 1,
}) {
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

async function updateConcerts() {
  const { data } = await fetchData({});

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

window.addEventListener("load", () => updateConcerts().catch(console.error));
