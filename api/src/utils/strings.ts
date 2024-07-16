export function capitalizeLetter(s: string) {
  if (s == "tomtom") {
    return "TomTom";
  }

  let stringBuff = "";
  const sentence = s.split(" ");

  for (let i = 0; i < sentence.length; i++) {
    stringBuff += sentence[i][0].toUpperCase() + sentence[i].slice(1) + " ";
  }

  return stringBuff.trim();
}

export function buildCountryObject(
  country_value: string,
  country_emoji: string,
  country_name: string
) {
  return {
    label: `${country_emoji} - ${country_name}`,
    value: country_value,
  };
}

export function buildRedisKey(
  base: string,
  country: string | undefined,
  town: string | undefined
): string {
  if (country != undefined) {
    base += `:${country}`;
  }
  if (town != undefined) {
    base += `:${town}`;
  }
  return base;
}
