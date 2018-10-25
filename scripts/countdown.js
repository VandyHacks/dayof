function updateTime() {
  const end = new Date(2018, 10, 4, 12);
  const now = new Date();
  const diff = end !== now ? end - now : 0;
  let hours = Math.floor(diff / (1000 * (60 ** 2)));
  let minutes = Math.floor((diff % (1000 * (60 ** 2))) / (1000 * 60));
  let seconds = Math.floor((diff % (1000 * 60)) / 1000);

  hours = hours < 10 ? `0${hours}` : `${hours}`;
  minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  document.querySelector('#hours').innerHTML = hours;
  document.querySelector('#minutes').innerHTML = minutes;
  document.querySelector('#seconds').innerHTML = seconds;
}

updateTime();
setInterval(updateTime, 1000);
