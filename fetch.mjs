async function test() {
  const res = await fetch("http://localhost:3000");
  const text = await res.text();
  console.log(text.substring(0, 500));
}
test();
