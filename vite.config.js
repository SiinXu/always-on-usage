import {defineConfig} from "vite";import fs from "fs";
const html=["index.html","compare.html","calculator.html","about.html","sources.html","scenarios.html",...fs.readdirSync("cases").map(f=>"cases/"+f)];
export default defineConfig({base:process.env.BASE||"/",build:{rollupOptions:{input:Object.fromEntries(html.map(h=>[h.replace(/\W/g,"_"),h]))}}});
