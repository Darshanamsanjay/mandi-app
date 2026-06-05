const token = "bweqhgqhltgaltkwaexwsdgotghvblzvqjuk";
const lat = 17.3616;
const lng = 78.4747;

async function testGeocode() {
  try {
    const url = `https://apis.mappls.com/advancedmaps/v1/${token}/rev_geocode?lat=${lat}&lng=${lng}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log("Method 1 Data:", data);
  } catch(e) {
    console.error("Method 1 Error:", e.message);
  }

  try {
    const url2 = `https://search.mappls.com/search/address/rev-geocode?lat=${lat}&lng=${lng}`;
    const res2 = await fetch(url2, { headers: { "Authorization": `Bearer ${token}` } });
    const data2 = await res2.json();
    console.log("Method 2 Data:", data2);
  } catch(e) {
    console.error("Method 2 Error:", e.message);
  }
}

testGeocode();
