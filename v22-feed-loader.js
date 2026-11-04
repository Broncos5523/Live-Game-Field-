(async()=>{try{
const response=await fetch('./preview-nfl-branding-v21.html',{cache:'no-store'});if(!response.ok)throw Error('V21 unavailable');
let source=await response.text();
const anchor='document.open();document.write(s);document.close();';
if(!source.includes(anchor))throw Error('V21 structure changed');
const liveScript=`<script src="./v22-espn-live.js"></`+`script>`;
source=source.replace(anchor,"s=s.replace('</body>',"+JSON.stringify(liveScript)+"+'</body>');"+anchor);
document.open();document.write(source);document.close();
}catch(e){document.body.textContent='V22 loading failed: '+e.message}})();