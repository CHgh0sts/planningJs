"use strict";(()=>{var e={};e.id=476,e.ids=[476],e.modules={3524:e=>{e.exports=require("@prisma/client")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1906:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>w,patchFetch:()=>c,requestAsyncStorage:()=>m,routeModule:()=>l,serverHooks:()=>U,staticGenerationAsyncStorage:()=>v});var n={};r.r(n),r.d(n,{PUT:()=>d});var a=r(3278),s=r(5002),i=r(4877),o=r(3524),u=r(1309);let p=new o.PrismaClient;async function d(e){try{let{id:t,title:r,description:n,startDate:a,endDate:s,isFullDay:i,userId:o}=await e.json();if(!t||!r||!a||!s||!o)return u.NextResponse.json({error:"Les informations essentielles sont requises."},{status:400});if(!await p.event.findUnique({where:{id:parseInt(t,10)}}))return u.NextResponse.json({error:"\xc9v\xe9nement introuvable"},{status:404});let d=o.split("/").map(Number),l=new Date(Date.UTC(new Date(a).getUTCFullYear(),new Date(a).getUTCMonth(),new Date(a).getUTCDate(),new Date(a).getUTCHours(),new Date(a).getUTCMinutes())),m=new Date(Date.UTC(new Date(s).getUTCFullYear(),new Date(s).getUTCMonth(),new Date(s).getUTCDate(),new Date(s).getUTCHours(),new Date(s).getUTCMinutes())),v=await p.event.update({where:{id:parseInt(t,10)},data:{title:r,subtitle:n||"",debutAt:l,finAt:m,fullDay:i,userId:{set:d.map(e=>({id:e}))}}});return u.NextResponse.json(v,{status:200})}catch(e){return console.error("Erreur lors de la mise \xe0 jour de l'\xe9v\xe9nement:",e),u.NextResponse.json({error:"Erreur lors de la mise \xe0 jour de l'\xe9v\xe9nement"},{status:500})}}let l=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/eventsUpdate/[id]/route",pathname:"/api/eventsUpdate/[id]",filename:"route",bundlePath:"app/api/eventsUpdate/[id]/route"},resolvedPagePath:"/Users/chghosts/Developpement/planningJs/app/api/eventsUpdate/[id]/route.js",nextConfigOutput:"",userland:n}),{requestAsyncStorage:m,staticGenerationAsyncStorage:v,serverHooks:U}=l,w="/api/eventsUpdate/[id]/route";function c(){return(0,i.patchFetch)({serverHooks:U,staticGenerationAsyncStorage:v})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[379,833],()=>r(1906));module.exports=n})();