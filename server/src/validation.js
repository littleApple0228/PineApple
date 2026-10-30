export function validateActivity(body){
 if(!body || typeof body !== 'object' || Array.isArray(body)) return {error:'請提供活動資料。'};
 const {title,description='',startsAt}=body;
 if(typeof title!=='string'||!title.trim()||title.trim().length>100)return {error:'活動名稱必填，最多 100 字。'};
 if(typeof description!=='string'||description.length>2000)return {error:'活動說明最多 2000 字。'};
 if(typeof startsAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(startsAt))return {error:'請填寫有效的活動時間。'};
 const year=Number(startsAt.slice(0,4));const date=new Date(startsAt+'Z');
 if(year<1000||year>9999||!Number.isFinite(date.getTime())||date.toISOString().slice(0,16)!==startsAt)return {error:'活動日期或時間無效。'};
 return {data:{title:title.trim(),description:description.trim(),startsAt:startsAt.replace('T',' ')+':00'}};
}
