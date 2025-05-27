export class Utils {
  static getSeason(date: string): string {
    const hemispheres = {
      Northern: ["Winter", "Spring", "Summer", "Autumn"],
      Southern: ["Summer", "Autumn", "Winter", "Spring"],
    };
    const d = new Date(date);
    const month = d.getMonth();
    const day = d.getDate();
    const hemisphere = "Northern";

    if (month < 2 || (month === 2 && day <= 20) || month === 11)
      return hemispheres[hemisphere][0];
    if (month < 5 || (month === 5 && day <= 21))
      return hemispheres[hemisphere][1];
    if (month < 8 || (month === 8 && day <= 22))
      return hemispheres[hemisphere][2];
    return hemispheres[hemisphere][3];
  }
  static getTimezone(timezone) {
    if (timezone) {
      return timezone;
    }
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  static getCurrentDate() {
    return new Date().toISOString();
  }

  static isAssetUrl(url) {
    const { pathname } = new URL(url);
    return pathname.startsWith("/assets/");
  }

  static selectEquitably({ a, b, c, d }, itemCount = 9) {
    const sources = [a, b, c, d];
    const result = {};

    let combinedItems = [];
    sources.forEach((source, index) => {
      combinedItems.push(
        ...Object.keys(source).map((key) => ({ source: index, key })),
      );
    });

    combinedItems = combinedItems.sort(() => Math.random() - 0.5);

    let selectedCount = 0;
    while (selectedCount < itemCount && combinedItems.length > 0) {
      const { source, key } = combinedItems.shift();
      const sourceObject = sources[source];

      if (!result[key]) {
        result[key] = sourceObject[key];
        selectedCount++;
      }
    }

    return result;
  }
}
