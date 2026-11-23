const test = require("node:test");
const assert = require("node:assert/strict");
const {summarize} = require("./core");
const sample = (times,status=200) => ({log:{entries:times.map(time => ({time,request:{},response:{status}}))}});
test("Cada duração cai em uma única faixa inclusive nos limites", () => {
  assert.deepEqual(summarize(sample([0,99.9,100,499,500,1999,2000,5000,-1,null,"90"])).latency,[2,2,2,2,3]);
});
test("Código ausente ou fora de faixa permanece desconhecido", () => {
  for(const code of [0,600,99,200.1,null,"200"]) assert.equal(summarize(sample([10],code)).status.desconhecido,1);
  for(const code of [100,204,302,404,503]) assert.equal(summarize(sample([10],code)).status[Math.floor(code/100)+"xx"],1);
});
test("Captura vazia e entradas repetidas preservam as contagens", () => {
  assert.equal(summarize(sample([])).requests,0);
  assert.equal(summarize(sample([100,100])).requests,2);
});
test("Dados inválidos e capturas grandes são recusados", () => {
  for(const data of [null,{}, {log:{entries:{}}},{log:{entries:[null]}},{log:{entries:[{request:[],response:{}}]}},sample(Array(50001).fill(0))])
    assert.throws(() => summarize(data));
});
test("Texto de origem nunca entra no boletim", () => {
  const har = sample([100]);
  const before = summarize(har);
  Object.assign(har.log.entries[0],{comment:"DADO_FICTICIO",startedDateTime:"DADO_FICTICIO",serverIPAddress:"DADO_FICTICIO"});
  Object.assign(har.log.entries[0].request,{url:"DADO_FICTICIO",headers:[{value:"DADO_FICTICIO"}],postData:{text:"DADO_FICTICIO"}});
  har.log.entries[0].response.content={text:"DADO_FICTICIO"};
  assert.deepEqual(summarize(har),before);
});


test("em HAR com dados sensíveis, apenas histogramas inteiros são produzidos",()=>{
  const confidential={
    log:{entries:[
      {time:100,request:{url:"https://privado.exemplo.test/segredo?token=NAO_EXPORTAR",cookies:[{value:"NAO_EXPORTAR"}]},response:{status:200,headers:[{value:"NAO_EXPORTAR"}]}},
      {time:2600,request:{headers:[{value:"NAO_EXPORTAR"}]},response:{status:503,content:{text:"NAO_EXPORTAR"}}}
    ]}
  };
  const data=summarize(confidential);
  assert.deepEqual(Object.keys(data).sort(),["latency","requests","status"]);
  assert.equal(data.requests,2);
  assert.deepEqual(data.latency,[0,1,0,1,0]);
  assert.equal(data.status["2xx"],1);
  assert.equal(data.status["5xx"],1);
  assert.doesNotMatch(JSON.stringify(data),/NAO_EXPORTAR|segredo|token=/);
});
