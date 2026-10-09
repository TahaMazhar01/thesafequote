import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { richTextSchema, blocksToRichText } from "../src/lib/rich-text";
import { newBlock } from "../src/lib/blog";
import { RichContent } from "../src/components/rich-content";
test("legacy article text and styling convert without loss",()=>{
 const content=blocksToRichText([{...newBlock("h2"),text:"A heading"},{...newBlock(),text:"First line\nSecond line",url:"/contact",bold:true},{...newBlock("list"),text:"One\nTwo"}]);
 assert.ok(richTextSchema.safeParse(content).success);
 const html=renderToStaticMarkup(createElement(RichContent,{content}));
 assert.match(html,/<h2/);assert.match(html,/First line/);assert.match(html,/Second line/);assert.match(html,/href="\/contact"/);assert.match(html,/<strong/);assert.match(html,/<ul/);
});
test("rich text rejects scripts and dangerous URLs while escaping text",()=>{
 assert.equal(richTextSchema.safeParse({type:"doc",content:[{type:"script",text:"bad"}]}).success,false);
 assert.equal(richTextSchema.safeParse({type:"doc",content:[{type:"paragraph",content:[{type:"text",text:"link",marks:[{type:"link",attrs:{href:"javascript:alert(1)"}}]}]}]}).success,false);
 assert.equal(richTextSchema.safeParse({type:"doc",content:[{type:"image",attrs:{src:"data:image/svg+xml,bad"}}]}).success,false);
 const content=richTextSchema.parse({type:"doc",content:[{type:"paragraph",content:[{type:"text",text:"<script>alert(1)</script>"}]}]});
 assert.match(renderToStaticMarkup(createElement(RichContent,{content})),/&lt;script&gt;/);
 let deep:unknown={type:"paragraph"};for(let i=0;i<30;i++)deep={type:"blockquote",content:[deep]};assert.equal(richTextSchema.safeParse({type:"doc",content:[deep]}).success,false);
});
