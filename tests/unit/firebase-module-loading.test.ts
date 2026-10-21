import { execFileSync } from "node:child_process";
import { expect, it } from "vitest";

it("loads Firebase Auth and converts JWKS keys without require(ESM) support", () => {
  const output = execFileSync(
    process.execPath,
    [
      "--no-experimental-require-module",
      "--input-type=commonjs",
      "-e",
      `
  require('firebase-admin/auth');
  const {createRequire}=require('node:module');
  const requireFromAuth=createRequire(require.resolve('firebase-admin/auth'));
  const jwksClient=requireFromAuth('jwks-rsa');
  const {generateKeyPairSync}=require('node:crypto');
  const {publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
  const client=jwksClient({jwksUri:'https://unused.invalid/jwks'});
  client.getKeys=async()=>[{...publicKey.export({format:'jwk'}),kid:'regression-key',use:'sig',alg:'RS256'}];
  client.getSigningKeys().then(keys=>{
   if(keys.length!==1||!keys[0].getPublicKey().includes('BEGIN PUBLIC KEY'))process.exit(1);
   console.log('firebase-auth-and-jwks-ok');
  }).catch(()=>process.exit(1));
 `,
    ],
    { encoding: "utf8", timeout: 15000 },
  );
  expect(output).toContain("firebase-auth-and-jwks-ok");
});
