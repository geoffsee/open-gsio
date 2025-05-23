export default class IPParser {
  /**
   * Parse and validate an IP address (IPv4 only for simplicity).
   * @param {string} ip - The IP address to parse.
   * @returns {number[]} - Parsed IP address as an array of numbers.
   * @throws {Error} - If the IP is invalid.
   */
  static parseIP(ip) {
    const octets = ip?.split(".");
    if (octets?.length !== 4) {
      throw new Error("Invalid IP address format");
    }
    return octets.map((octet) => {
      const num = parseInt(octet, 10);
      if (isNaN(num) || num < 0 || num > 255) {
        throw new Error("Invalid IP address octet");
      }
      return num;
    });
  }

  /**
   * Convert an IP address to a 32-bit integer for comparison.
   * @param {number[]} ipArray - IP address as an array of numbers.
   * @returns {number} - 32-bit integer representation of the IP.
   * @private
   */
  static #ipToInt(ipArray) {
    return (
      ((ipArray[0] << 24) |
        (ipArray[1] << 16) |
        (ipArray[2] << 8) |
        ipArray[3]) >>>
      0
    ); // Ensure unsigned 32-bit
  }

  /**
   * Check if an IP is within a given CIDR range.
   * @param {string} ip - The IP address to check.
   * @param {string} cidr - CIDR range (e.g., "192.168.0.0/24").
   * @returns {boolean} - True if the IP is within the range, otherwise false.
   * @throws {Error} - If either the IP or CIDR format is invalid.
   */
  static isInRange(ip, cidr) {
    if (!cidr || typeof cidr !== "string" || cidr.length < 0) {
      return false;
    }

    const [range, prefixLength] = cidr.split("/");
    if (!prefixLength) {
      throw new Error("Invalid CIDR format");
    }

    const ipArray = IPParser.parseIP(ip);
    const rangeArray = IPParser.parseIP(range);

    const ipInt = IPParser.#ipToInt(ipArray);
    const rangeInt = IPParser.#ipToInt(rangeArray);

    const mask = ~(2 ** (32 - parseInt(prefixLength, 10)) - 1) >>> 0;
    return (rangeInt & mask) === (ipInt & mask);
  }
}
