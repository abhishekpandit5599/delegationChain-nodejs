const crypto = require('crypto');
const fetch = require('node-fetch-commonjs')
global.crypto = crypto.webcrypto;
global.fetch = fetch;
const {DelegationIdentity, Ed25519PublicKey, ECDSAKeyIdentity, DelegationChain} = require("@dfinity/identity");
const { toHex, fromHex, HttpAgent } = require('@dfinity/agent');
const { backend, createActor } = require('./backend');


let actor = backend

const whoami = async() => {
    let principal = await backend.whoami();
    console.log("principal",principal);
}
// whoami();

const generateIdentity = async () => {
    let p = new Promise(async(resolve,reject)=>{
      await ECDSAKeyIdentity.generate({extractable: true})
      .then(async(res)=>{
        resolve(res)
      }
        )
      .catch((err)=>{
          console.log(err)
          reject(err)
          })
    })
    
   return p 
  };

  async function main(pubKey,priKey,deepLink){
    // let generateKey = await generateIdentity();
    // console.log("generateKey",generateKey)
    // console.log("toHex(generateKey.getPublicKey().toDer())",toHex(generateKey.getPublicKey().toDer()))
    // let pubKey = toHex(await crypto.webcrypto.subtle.exportKey("raw",generateKey._keyPair.publicKey));
    // let priKey = toHex(await crypto.webcrypto.subtle.exportKey("pkcs8",generateKey._keyPair.privateKey));
    console.log("pubKey",pubKey)
    console.log("priKey",priKey)
    let publicKey = await crypto.webcrypto.subtle.importKey("raw",
    Buffer.from(fromHex(pubKey)),
    { name: "ECDSA", namedCurve: "P-256" }, // Adjust the algorithm and curve as needed
    true, // Whether the key is extractable
    ["verify"] )
    console.log("generateKey._keyPair.publicKey",publicKey)
    
    let privateKey = await crypto.webcrypto.subtle.importKey("pkcs8",
    Buffer.from(fromHex(priKey)),
    { name: "ECDSA", namedCurve: "P-256" }, // Adjust the algorithm and curve as needed
    true, // Whether the key is extractable
    ["sign"] )
    console.log("generateKey._keyPair.privateKey",privateKey)
    let newKeyPair = await ECDSAKeyIdentity.fromKeyPair({privateKey,publicKey})
    console.log("newKeyPair",toHex(newKeyPair.getPublicKey().toDer()));


    // let deepLink = `rentspace://auth?delegation=%7B%22delegations%22%3A%5B%7B%22delegation%22%3A%7B%22expiration%22%3A%2217a871a3ec5f3d32%22%2C%22pubkey%22%3A%223059301306072a8648ce3d020106082a8648ce3d03010703420004f957ef826bfb550dba8a7cbd4c5579e6c3ae2a79100184b5442667596b47eda106caee0dd3e214e3b6a218bff26474fba218f6eee3baec6592434dbf3d2f2165%22%7D%2C%22signature%22%3A%22d9d9f7a26b63657274696669636174655901fdd9d9f7a2647472656583018301830183024863616e6973746572830183018301830183024a000000000000000701018301830183024e6365727469666965645f6461746182035820967ca7559d9f3836ae0e586748f5b2b1d8b000b3441f4eb3fe9304fa3b9a714d82045820eeebdca966b95b97cecdf624e005758a11b5d031b574818565faaa89fc5a258b82045820289a4c65be27debe9b75821064215d86c7d0aba5ba6062738f12431008e632c2820458200a7d3acb389c7ff802633753a027a8b11196e66d2cfd25f9566b1334cf890a0282045820e2a847f267054aaf7e9a6d6e810bbd9cfe3ea22aaa672b940b0b7ff9e20639a7820458205ebed2cc77c1930e4fe20ad9024b94ce60c5afeefc687a4492489cef66af07e0820458202d05337b529d6c568646aec1d07246b0d4afe14b0fb107ba12d5ab3305b59d618204582099e1f33182164b9f781298ad9d65abfcad8cb0b8acf298a7128f20b3b4bd03e082045820281ca12c7cccf6091445af73ca412e7213c17df08ae9b1a82343ae8a12badec4830182045820d32c63ce928128760a447248cc7067179e8a901193a211e0075196e6154999ab83024474696d658203499cb690f4a8ee95d417697369676e617475726558309478c1c70d42f3cc3ffd046ea203f725b54482addae7c8d3407860afe921d923db5da01e6ae58f38ad8ad5ab991f9da76474726565830182045820e8a72f1911cbf8e5ad0600777b45f4974fb567cb91921248cc2395825bf38d4983024373696783025820666adba565daec36f7ebbb20b610f6d0806d7e5c149dc52bf1387650fc81d2de830258201a049c112ef639dcf9262c78408d63661ba4c1e8ea8254183455d419275b326c820340%22%7D%5D%2C%22publicKey%22%3A%22303c300c060a2b0601040183b8430102032c000a00000000000000070101767b98c61bc96c906de69e60183a9f460ae998ee27b140597e78a3db5590a4c1%22%7D`

    const urlObject = new URL(deepLink);
    const delegation = urlObject.searchParams.get('delegation');
    console.log("delegation",delegation);

    const chain = DelegationChain.fromJSON(
        JSON.parse(decodeURIComponent(delegation)),
      );
      console.log("chain",chain);
      const middleIdentity = DelegationIdentity.fromDelegation(
        newKeyPair,
        chain,
      );
      console.log("middleIdentity",middleIdentity);
      const agent = new HttpAgent({identity: middleIdentity,fetchOptions: {
        reactNative: {
          __nativeResponseType: 'base64',
        },
      },
      callOptions: {
        reactNative: {
          textStreaming: true,
        },
      },
      fetch,
      blsVerify: () => true,
      host: 'http://127.0.0.1:4943',
    });

      console.log("agent",agent);

      actor = createActor('bkyz2-fmaaa-aaaaa-qaaaq-cai', {
        agent,
      });
      console.log("actor",actor);

      console.log("middleIdentity",middleIdentity.getPrincipal().toString())

      let principal = await actor.whoami();
      console.log("principal",principal);
  }
  main("046740ba6cb298256517f176d581f2ac1fbe17272ed60fa285d491f64836cb014701ca09bc31d75f48ce474660a2fa37ac07fe081ccbf9cd67830ccb0872380b45","308187020100301306072a8648ce3d020106082a8648ce3d030107046d306b020101042028e0c7904802b62fc535f0443f02ebb15f7b7934700d29f1a7359c49a9aec78ba144034200046740ba6cb298256517f176d581f2ac1fbe17272ed60fa285d491f64836cb014701ca09bc31d75f48ce474660a2fa37ac07fe081ccbf9cd67830ccb0872380b45","rentspace://auth?delegation=%7B%22delegations%22%3A%5B%7B%22delegation%22%3A%7B%22expiration%22%3A%2217a87c5d9690d500%22%2C%22pubkey%22%3A%223059301306072a8648ce3d020106082a8648ce3d030107034200046740ba6cb298256517f176d581f2ac1fbe17272ed60fa285d491f64836cb014701ca09bc31d75f48ce474660a2fa37ac07fe081ccbf9cd67830ccb0872380b45%22%7D%2C%22signature%22%3A%22d9d9f7a26b63657274696669636174655901fdd9d9f7a2647472656583018301830183024863616e6973746572830183018301830183024a000000000000000701018301830183024e6365727469666965645f64617461820358202242fb8ebf5349351e08ece062fd6921396e23a807562d6fa0889b1617c5c77682045820eeebdca966b95b97cecdf624e005758a11b5d031b574818565faaa89fc5a258b82045820289a4c65be27debe9b75821064215d86c7d0aba5ba6062738f12431008e632c2820458200a7d3acb389c7ff802633753a027a8b11196e66d2cfd25f9566b1334cf890a0282045820e2a847f267054aaf7e9a6d6e810bbd9cfe3ea22aaa672b940b0b7ff9e20639a7820458207ca2d59d04db6b48d86404cb3dd99cbcda30054bfc30d7418b87793beecd97f4820458202d05337b529d6c568646aec1d07246b0d4afe14b0fb107ba12d5ab3305b59d61820458206d710600d06badfe1c8aa78bb4ea523986c4a19da38d393e3ebca5b85ef93cc1820458202bd835e96a8bb276f1d605e58c568f4cf8bd11f43fa7793e4c6926b2c661dbea830182045820b91edf976d57de97fdba57a151cd3131cfb4241dd2ab640b21c63b74faf58be783024474696d65820349d3eff4c5c3c598d417697369676e61747572655830a9f37470978e0f70c5dd2d15f3cde53764cbf9c7d768b90e0492ff2c679f61f5a993a2129df643364c8ff84ececd1f626474726565830182045820e8a72f1911cbf8e5ad0600777b45f4974fb567cb91921248cc2395825bf38d49830243736967830258205c1916235dc92447a11aab98840d058de15528d9ff2271f5148d3835ca89068683025820a0ff6089d6023c3d74855d306493c1c980addee361aec76dfb30d565fb837772820340%22%7D%5D%2C%22publicKey%22%3A%22303c300c060a2b0601040183b8430102032c000a00000000000000070101b2e23e3ac1dfba40754bbedc95286eb99186b4c76490b95764e6c535853a2044%22%7D");