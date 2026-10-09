import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DynamicFields } from "../src/components/dynamic-fields";
import { fieldsSchema, validateAnswers, type FormField } from "../src/lib/forms";
import { plainText } from "../src/lib/plain-text";
const field:FormField={id:"field_custom",label:"Custom field",placeholder:"Type here",type:"text",required:false,options:[],width:"half"};
test("new dynamic fields normalize text and reject HTML, wrong types and extra keys",()=>{
 assert.deepEqual(validateAnswers([field],{field_custom:"  O'Connor\u0000  "}),{answers:{field_custom:"O'Connor"},errors:{}});
 for(const value of ['<script>alert(1)</script>','<img src=x onerror=alert(1)>','<svg/onload=alert(1)>']) assert.ok(validateAnswers([field],{field_custom:value}).errors.field_custom);
 assert.ok(validateAnswers([field],{field_custom:true}).errors.field_custom);
 assert.ok(validateAnswers([field],{field_custom:"okay",extra:"x"}).errors.form);
 assert.ok(validateAnswers([field],{field_custom:"x".repeat(255)}).errors.field_custom);
 assert.ok(validateAnswers([field],JSON.parse('{"__proto__":"x"}')).errors.form);
 assert.equal(plainText(5000).safeParse('<img src=x>').success,false);
 for(const change of [{label:"<b>Name</b>"},{placeholder:'"><svg/onload=alert(1)>'},{type:"select",options:["<script>x</script>"]}]) assert.equal(fieldsSchema.safeParse([{...field,...change}]).success,false);
 assert.equal(fieldsSchema.safeParse([{...field,id:"constructor"}]).success,false);
 const sql="Robert'); DROP TABLE fa_leads;--";
 assert.equal(validateAnswers([field],{field_custom:sql}).answers.field_custom,sql);
});
test("legacy untrusted text is escaped in field labels, placeholders and values",()=>{
 const payload='<img src=x onerror=alert(1)>';
 const html=renderToStaticMarkup(createElement(DynamicFields,{fields:[{...field,label:payload,placeholder:payload}],prefix:"test",values:{field_custom:payload},onChange:()=>{}}));
 assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));
 const encoded='&lt;script&gt;alert(1)&lt;/script&gt;';
 const safe=renderToStaticMarkup(createElement(DynamicFields,{fields:[field],prefix:"test",values:{field_custom:encoded},onChange:()=>{}}));
 assert.ok(safe.includes('&amp;lt;script'));
});
