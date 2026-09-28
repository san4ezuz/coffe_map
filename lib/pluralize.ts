export function placesCount(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word = "мест";
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = "место";
    else if (mod10 >= 2 && mod10 <= 4) word = "места";
  }
  return `${n} ${word}`;
}
