// India IATA airport list for the compare + alert features.
// Metros first, then tier-2 + regional. ~60 entries.

export type Airport = { code: string; city: string; name: string };

export const DOMESTIC_AIRPORTS: Airport[] = [
  // Metros
  { code: "DEL", city: "Delhi", name: "Indira Gandhi Intl" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Intl" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda Intl" },
  { code: "MAA", city: "Chennai", name: "Chennai Intl" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi Intl" },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose Intl" },

  // Tier-1 travel hubs
  { code: "IDR", city: "Indore", name: "Devi Ahilya Bai Holkar" },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel Intl" },
  { code: "PNQ", city: "Pune", name: "Pune" },
  { code: "GOI", city: "Goa (Dabolim)", name: "Dabolim" },
  { code: "GOX", city: "Goa (Mopa)", name: "Manohar Intl" },
  { code: "COK", city: "Kochi", name: "Cochin Intl" },
  { code: "TRV", city: "Thiruvananthapuram", name: "Trivandrum Intl" },
  { code: "CCJ", city: "Kozhikode", name: "Calicut Intl" },
  { code: "IXE", city: "Mangaluru", name: "Mangalore Intl" },
  { code: "JAI", city: "Jaipur", name: "Jaipur Intl" },
  { code: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh Intl" },
  { code: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri Intl" },
  { code: "NAG", city: "Nagpur", name: "Dr. Babasaheb Ambedkar Intl" },
  { code: "BBI", city: "Bhubaneswar", name: "Biju Patnaik Intl" },
  { code: "PAT", city: "Patna", name: "Jay Prakash Narayan" },
  { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi Intl" },
  { code: "IXC", city: "Chandigarh", name: "Chandigarh Intl" },
  { code: "ATQ", city: "Amritsar", name: "Sri Guru Ram Dass Jee Intl" },
  { code: "VTZ", city: "Visakhapatnam", name: "Visakhapatnam" },
  { code: "CJB", city: "Coimbatore", name: "Coimbatore Intl" },
  { code: "TRZ", city: "Tiruchirappalli", name: "Tiruchirappalli Intl" },
  { code: "MYQ", city: "Mysuru", name: "Mysore" },
  { code: "IXB", city: "Bagdogra", name: "Bagdogra" },
  { code: "IXR", city: "Ranchi", name: "Birsa Munda" },
  { code: "RPR", city: "Raipur", name: "Swami Vivekananda" },
  { code: "BHO", city: "Bhopal", name: "Raja Bhoj" },
  { code: "JLR", city: "Jabalpur", name: "Jabalpur" },
  { code: "UDR", city: "Udaipur", name: "Maharana Pratap" },
  { code: "JDH", city: "Jodhpur", name: "Jodhpur" },
  { code: "JSA", city: "Jaisalmer", name: "Jaisalmer" },
  { code: "KQH", city: "Kishangarh", name: "Kishangarh" },
  { code: "DED", city: "Dehradun", name: "Jolly Grant" },
  { code: "DHM", city: "Dharamshala", name: "Gaggal" },
  { code: "KUU", city: "Kullu", name: "Bhuntar" },
  { code: "SXR", city: "Srinagar", name: "Sheikh ul-Alam Intl" },
  { code: "IXJ", city: "Jammu", name: "Jammu" },
  { code: "IXL", city: "Leh", name: "Kushok Bakula Rimpochee" },
  { code: "PGH", city: "Pantnagar", name: "Pantnagar" },
  { code: "GWL", city: "Gwalior", name: "Gwalior" },
  { code: "KNU", city: "Kanpur", name: "Chakeri" },
  { code: "AGR", city: "Agra", name: "Agra" },
  { code: "GOP", city: "Gorakhpur", name: "Gorakhpur" },
  { code: "DBR", city: "Darbhanga", name: "Darbhanga" },
  { code: "IXS", city: "Silchar", name: "Kumbhirgram" },
  { code: "DIB", city: "Dibrugarh", name: "Dibrugarh" },
  { code: "IMF", city: "Imphal", name: "Bir Tikendrajit Intl" },
  { code: "DMU", city: "Dimapur", name: "Dimapur" },
  { code: "AJL", city: "Aizawl", name: "Lengpui" },
  { code: "SHL", city: "Shillong", name: "Shillong" },
  { code: "IXA", city: "Agartala", name: "Maharaja Bir Bikram" },
  { code: "BDQ", city: "Vadodara", name: "Vadodara" },
  { code: "RAJ", city: "Rajkot", name: "Rajkot Intl (Hirasar)" },
  { code: "BHU", city: "Bhavnagar", name: "Bhavnagar" },
  { code: "HBX", city: "Hubli", name: "Hubli" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda Intl" },
  { code: "STV", city: "Surat", name: "Surat" },
  { code: "IXD", city: "Allahabad (Prayagraj)", name: "Bamrauli" },
  { code: "TIR", city: "Tirupati", name: "Tirupati" },
  { code: "VGA", city: "Vijayawada", name: "Vijayawada" },
  { code: "IXU", city: "Aurangabad", name: "Aurangabad" },
  { code: "PYG", city: "Pakyong", name: "Pakyong (Sikkim)" },
].filter((a, i, arr) => arr.findIndex((b) => b.code === a.code) === i);

export const IATA_CODES: Set<string> = new Set(DOMESTIC_AIRPORTS.map((a) => a.code));

export function isValidIATA(code: string): boolean {
  return typeof code === "string" && code.length === 3 && IATA_CODES.has(code.toUpperCase());
}

export function airportLabel(code: string): string {
  const a = DOMESTIC_AIRPORTS.find((x) => x.code === code);
  return a ? `${a.code} — ${a.city}` : code;
}
