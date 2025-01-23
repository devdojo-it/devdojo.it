type TTommy = {
  seqFlow: boolean;
};

let tommy: TTommy = { seqFlow: true };

tommy.valueOf = () => 4;

function add(num1, num2) {
  return num1 + num2 + +tommy;
}

console.log("Hello world!");
console.log("Hello world! 2");
console.log("Hello world! 3", add(5, 3));

async function* asyncGen() {
  yield 1;
  yield 2;
  yield 3;
}

async function testAsyncGen() {
  for await (const item of asyncGen()) {
    console.log(item);
  }
}

testAsyncGen();
